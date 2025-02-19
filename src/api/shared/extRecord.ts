"use server";

import { DataRecord } from "~/schema/type"
import { _deleteById, _updateRecord } from "../../server-only/mutate"
import { _getRecordById, getValueById } from "~/server-only/select"
import { _insertRecord } from "../../server-only/mutate"
import { getExtTableName } from "~/util"
import { schema } from "~/schema/schema"
import { getValueTypeTableNameByColType } from "~/schema/dataTypes"
import { getTypeByRecordId } from "../../server-only/valueType"
import { setExplRecordId, startExpl } from "~/server-only/expl"
import { getUserSession } from "../../server-only/session"

export const insertExtRecord = async (
  tableName: string,
  record: DataRecord,
  extTableName: string,
  extRecord: DataRecord
) => {
  const userSession = await getUserSession()
  const explId = await startExpl(userSession.userId, 'genericChange', 1, tableName, null);
  const result = await _insertRecord(tableName, record, explId)
  if (result) {
    await _insertRecord(extTableName, {id: result.id, ...extRecord}, explId)
    await setExplRecordId(explId, result.id)
  }
  return result
}

export const updateExtRecord = async (
  tableName: string,
  id: number,
  record: DataRecord,
  extTableName: string,
  extRecord: DataRecord
) => {
  const userSession = await getUserSession()
  const explId = await startExpl(userSession.userId, 'genericChange', 1, tableName, id)
  return Promise.all([
    _updateRecord(tableName, id, explId, record),
    _updateRecord(extTableName, id, explId, extRecord),
  ])
}

export const getOneExtRecordById = async (tableName: string, id: number) => {
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

export const deleteExtById = async (tableName: string, id: number) => {
  const result = await _getRecordById(tableName, id, ['id'])
  if (!result) return
  const extTableName = getExtTableName(tableName, result)
  await _deleteById(tableName, id)
  if (extTableName) {
    await _deleteById(extTableName, id)
  }
}
