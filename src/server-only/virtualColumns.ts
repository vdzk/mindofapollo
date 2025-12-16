import { resolveEntries } from "~/utils/async"
import { getDirConcsWithValues } from "./getDirConcsWithValues"
import { onError, sql } from "./db"

const virtualColumns: Record<string, Record<string,
  (ids: number[]) => Promise<Record<number, string | boolean>>
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
        JOIN argument_judgement aj ON aj.id = argument.id
        WHERE statement_id IN ${sql(ids)}
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
  }
}

export const getVirtualValuesByServerFn = async (
  tableName: string,
  colNames: string[],
  ids: number[]
) => resolveEntries(colNames.map(
  colName => [colName, virtualColumns[tableName][colName](ids)]
))
