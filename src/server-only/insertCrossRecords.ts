import { ExplData, FkEntries, UserActor } from "~/components/expl/types"
import { schema } from "~/schema/schema"
import { onError, sql } from "~/server-only/db"
import { finishExpl, startExpl } from "~/server-only/expl"
import { _getRecordById, _getRecordsByIds } from "~/server-only/select"
import { getUserActorUser, getUserId } from "~/server-only/session"
import { addExplIds } from "~/utils/expl"
import { titleColumnName, getXTable } from "~/utils/schema"

export const insertCrossRecords = async (
  tableName: string,
  id: number,
  linkedCrossRefs: Record<string, number[]>,
  trigger: ExplData['trigger']
) => {
  "use server"
  const empty = Object.values(linkedCrossRefs).every(v => v.length === 0)
  if (empty) return
  const userId = await getUserId()
  const explId = await startExpl(userId, 'insertCrossRecords', 1, tableName, id)

  const fkEnries: FkEntries = {}
  for (const aggregateName in linkedCrossRefs) {
    const aggregate = schema.tables[tableName].aggregates?.[aggregateName]
    if (!aggregate) continue
    const linkedIds = linkedCrossRefs[aggregateName]
    if (linkedIds.length === 0) continue
    const xTable = getXTable(tableName, aggregate.table, true)
    const records = linkedIds.map(linkedId => addExplIds({
      [xTable.aColName]: id,
      [xTable.bColName]: linkedId
    }, explId))
    await sql`
      INSERT into ${sql(xTable.name)} ${sql(records)}
    `.catch(onError)
    const titleCol = titleColumnName(aggregate.table)
    const fkRecords = await _getRecordsByIds(aggregate.table, 'id', linkedIds, ['id', titleCol])
    fkEnries[aggregateName] = {
      tableName: aggregate.table,
      options: fkRecords.map(fkRecord => ({
        id: fkRecord.id,
        label: fkRecord[titleCol] as string
      }))
    }
  }

  const targetTitleCol = titleColumnName(tableName)
  const targetRecord = await _getRecordById(tableName, id, [targetTitleCol])
  const data: InsertCrossRecordsData = {
    trigger,
    user: await getUserActorUser(),
    tableName,
    id,
    targetLabel: (targetRecord)[targetTitleCol] as string,
    fkEnries
  }
  await finishExpl(explId, data)
}

interface InsertCrossRecordsData {
  trigger: ExplData['trigger'],
  user: UserActor['user'],
  tableName: string,
  id: number,
  targetLabel: string,
  fkEnries: FkEntries
}

export const explInsertCrossRecords = (data: InsertCrossRecordsData): ExplData => ({
  trigger: data.trigger,
  actor: { type: 'user', user: data.user},
  action: 'added cross reference entries to',
  target: {
    tableName: data.tableName,
    id: data.id,
    label: data.targetLabel
  },
  insertedFkEntries: data.fkEnries
})