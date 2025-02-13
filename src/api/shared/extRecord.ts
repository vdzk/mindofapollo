"use server";

import { DataRecord } from "~/schema/type"
import { onError } from "../../db"
import { deleteById, safeWrap } from "./mutate";
import { getRecordById, getValueById } from "~/api/shared/select";
import { _insertRecord, updateRecord } from "./mutate";
import { getExtTableName } from "~/util"
import { schema } from "~/schema/schema";
import { getValueTypeTableNameByColType } from "~/schema/dataTypes";
import { getTypeByRecordId } from "./valueType";
import { Id } from "~/types";
import { setExplRecordId, startExpl } from "~/server-only/expl";

export const insertExtRecord = safeWrap(async (
  userId: number,
  tableName: string,
  record: DataRecord,
  extTableName: string,
  extRecord: DataRecord
) => {
  const explId = await startExpl(userId, 'genericChange', 1, tableName, null);
  const result = await _insertRecord(tableName, record, explId)
  if (result) {
    await _insertRecord(extTableName, {id: result.id, ...extRecord}, explId)
    await setExplRecordId(explId, result.id)
  }
})

export const updateExtRecord = (
  tableName: string,
  id: number,
  record: DataRecord,
  extTableName: string,
  extRecord: DataRecord
) => Promise.all([
  updateRecord(tableName, id, record),
  updateRecord(extTableName, id, extRecord),
]).catch(onError)

export const getExtRecordById = async (tableName: string, id: Id) => {
  const result = await getRecordById(tableName, id)
  if (!result) return

  const { columns } = schema.tables[tableName]
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
    const extResult = await getRecordById(extTableName, id)
    return {...result, ...extResult}
  } else {
    return result
  }
}

export const deleteExtById = async (tableName: string, id: Id) => {
  const result = await getRecordById(tableName, id)
  if (!result) return
  const extTableName = getExtTableName(tableName, result)
  await deleteById(tableName, id)
  if (extTableName) {
    await deleteById(extTableName, id)
  }
}
