import { _getRecordById, getValueById } from "../../server-only/select"
import { schema } from "~/schema/schema"
import { getValueTypeTableNameByColType } from "~/schema/dataTypes"
import { getTypeByRecordId } from "../../server-only/valueType"
import { getExtTableName } from "~/utils/schema"
import { whoCanGetOneRecordById } from "./recordById"
import { belongsTo, getAuthRole } from "~/server-only/session"
import { ofSelf } from "~/server-only/ofSelf"

export const whoCanGetOneExtRecordById = (tableName: string, ofSelf: boolean) => whoCanGetOneRecordById(tableName, ofSelf)

export const getOneExtRecordById = async (tableName: string, id: number) => {
  "use server"
  if (! await belongsTo(whoCanGetOneExtRecordById(
    tableName, await ofSelf(tableName, id)
  ))) return
  const { columns } = schema.tables[tableName]
  const result = await _getRecordById(tableName, id)
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
    const extResult = await _getRecordById(extTableName, id)
    return {...result, ...extResult}
  } else {
    return result
  }
}