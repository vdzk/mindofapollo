import { _getRecordById, getValueById } from "../../server-only/select"
import { schema } from "~/schema/schema"
import { getValueTypeTableNameByColType } from "~/schema/dataTypes"
import { getTypeByRecordId } from "../../server-only/valueType"
import { getExtTableName } from "~/util"

export const getOneExtRecordById = async (tableName: string, id: number) => {
  "use server"
  const { columns } = schema.tables[tableName]
  const colNames = Object.keys(columns)
  const result = await _getRecordById(tableName, id, colNames)
  if (!result) return

  for (const colName in columns) {
    const column = columns[colName]
    if (column.type === 'value_type_id') {
      const colType = await getTypeByRecordId(tableName, colName, result.id)
      const vttn = getValueTypeTableNameByColType(colType)
      const value = await getValueById(vttn, result[colName] as number)
      // insert the actual value
      result[colName] = value
    }
  }

  const extTableName = getExtTableName(tableName, result)
  if (extTableName) {
    const extResult = await _getRecordById(extTableName, id, Object.keys(schema.tables[extTableName].columns))
    return {...result, ...extResult}
  } else {
    return result
  }
}