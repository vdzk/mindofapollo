import { resolveEntries } from "~/utils/async"
import { getDirConcsWithValues } from "./getDirConcsWithValues"
import { onError, sql } from "./db"
import { DataLiteral, DataRecordWithId } from "~/schema/type"
import { statementTypeIds } from "~/tables/statement/statement_type"
import { calcMoralSum } from "~/calc/moralSum"
import { indexBy } from "~/utils/shape"

const virtualColumns: Record<string, Record<string,
  (ids: number[]) => Promise<Record<number, DataLiteral>>
>> = {
  directive_consequence: {
    label: async (ids: number[]) => {
      const {records, values} = await getDirConcsWithValues(ids)
      return Object.fromEntries(records.map(record => [record.id,
        `${record.moral_good} ${values[record.id]} ${record.unit}`
      ]))
    }
  },
  statement: {
    has_judged_argument: async (ids: number[]) => {
      const results = await sql`
        SELECT DISTINCT statement_id
        FROM argument
        WHERE argument.strength IS NOT NULL
          AND statement_id IN ${sql(ids)}
      `.catch(onError)
      const values: Record<number, boolean> = {}
      for (const row of results) {
        values[row.statement_id] = true
      }
      for (const id of ids) {
        if (!values[id]) {
          values[id] = false
        }
      }
      return values
    }
  },
  debate: {
    // TODO: cache the response
    current_value: async (ids: number[]) => {
      const debates = await sql<DataRecordWithId[]>`
        SELECT DISTINCT
          d.id, d.statement_id,
          st.statement_type_id, st.confidence,
          dnv.moral_weight_profile_id
        FROM debate d
        JOIN statement st ON st.id = d.statement_id
        LEFT JOIN debate_net_value dnv ON dnv.id = d.id
        WHERE d.creator_won IS NULL
          AND d.id IN ${sql(ids)}
      `.catch(onError)
      const directiveIds = []
      const moralProfileIds = []
      const debatesById: Record<number, DataRecordWithId> = {}
      const debateIdsByMoralProfileId: Record<number, number[]> = {}
      for (const debate of debates) {
        if (debate.statement_type_id === statementTypeIds.prescriptive) {
          directiveIds.push(debate.statement_id)
          const profileId = debate.moral_weight_profile_id as number
          moralProfileIds.push(profileId)
          const debateIds = debateIdsByMoralProfileId
          if (!debateIds[profileId]) debateIds[profileId] = []
          debateIds[profileId].push(debate.id)
        }
        debatesById[debate.id] = debate
      }
      let concs: DataRecordWithId[] = []
      if (directiveIds.length > 0) {
        concs = await sql<DataRecordWithId[]>`
          SELECT dc.id, a.pro, a.statement_id
          FROM argument a
          JOIN directive_consequence dc ON dc.argument_id = a.id
          WHERE a.statement_id IN ${sql(directiveIds)}
        `.catch(onError)
      }
      const concsById = indexBy(concs, 'id')
      const concsByDebateId: Record<number, DataRecordWithId[]> = {}
      const debatesByStatementId = indexBy(debates, 'statement_id')
      if (concs.length > 0) {
        const concData = await getDirConcsWithValues(concs.map(conc => conc.id), false)
        for (const concRecord of concData.records) {
          const concId = concRecord.id
          const conc = concsById[concId]
          const statementId = conc.statement_id as number
          const debate = debatesByStatementId[statementId]
          const debateId = debate.id as number
          if (!concsByDebateId[debateId]) concsByDebateId[debateId] = []
          concsByDebateId[debateId].push({
            id: concId,
            moral_good_id: concRecord.moral_good_id,
            column_type: concRecord.column_type,
            pro: conc.pro,
            value: concData.values[concId]
          })
        }
      }
      const weightsByDebateId: Record<number, DataRecordWithId[]> = {}
      if (moralProfileIds.length > 0) {
        const weights = await sql<DataRecordWithId[]>`
          SELECT id, profile_id, moral_good_id, weight
          FROM moral_weight_of_profile w
          WHERE profile_id IN ${sql(moralProfileIds)}
        `.catch(onError)
        for (const weight of weights) {
          const debateIds = debateIdsByMoralProfileId[weight.profile_id as number]
          if (!debateIds) continue
          for (const debateId of debateIds) {
            if (!weightsByDebateId[debateId]) weightsByDebateId[debateId] = []
            weightsByDebateId[debateId].push(weight)
          }
        }
      }
      const values: Record<number, number> = {}
      for (const id of ids) {
        let value: number
        const debate = debatesById[id]
        if (!debate) continue
        const prescriptive = debate.statement_type_id === statementTypeIds.prescriptive
        if (prescriptive) {
          value = calcMoralSum(
            concsByDebateId[id] ?? [],
            weightsByDebateId[id] ?? []
          ).sum
        } else {
          value = debate.confidence as number
        }
        values[id] = value
      }
      return values
    }
  }
}

export const getVirtualValuesByServerFn = async (
  tableName: string,
  colNames: string[],
  ids: number[]
) => resolveEntries(colNames.map(
  colName => [colName, virtualColumns[tableName][colName](ids)]
))
