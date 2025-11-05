import { _getRecordById, getValueById } from "../../server-only/select"
import { schema } from "~/schema/schema"
import { getValueTypeTableNameByColType } from "~/schema/dataTypes"
import { getTypeByRecordId } from "../../server-only/valueType"
import { getExtTableName } from "~/utils/schema"
import { whoCanGetOneRecordById } from "./recordById"
import { belongsTo } from "~/server-only/session"
import { ofSelf } from "~/server-only/ofSelf"
import { injectPermissions } from "~/server-only/permissions"

export const whoCanGetOneExtRecordById = (tableName: string, ofSelf: boolean) => whoCanGetOneRecordById(tableName, ofSelf)

export const getOneExtRecordById = async (
  tableName: string,
  id: number,
  withPermissions?: boolean
) => {
  "use server"
  if (! await belongsTo(whoCanGetOneExtRecordById(
    tableName, await ofSelf(tableName, id)
  ))) return
  const { columns, optionallyExtendedByTable } = schema.tables[tableName]
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

  if (withPermissions) await injectPermissions(tableName, [result])

  const extTableName = getExtTableName(tableName, result, !!optionallyExtendedByTable)
  if (extTableName) {
    const extResult = await _getRecordById(extTableName, id)
    return {...result, ...extResult}
  } else {
    return result
  }
}