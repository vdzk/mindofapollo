import { resolveEntries } from "~/utils/async"
import { getDirConcsWithValues } from "./getDirConcsWithValues"

const virtualColumns: Record<string, Record<string,
  (ids: number[]) => Promise<Record<number, string>>
>> = {
  directive_consequence: {
    label: async (ids: number[]) => {
      const {records, values} = await getDirConcsWithValues(ids)
      return Object.fromEntries(records.map(record => [record.id,
        `${record.moral_good} ${values[record.id]} ${record.unit}`
      ]))
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
