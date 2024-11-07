"use server";

import { DataRecord } from "~/schema/type"
import { deleteById, getRecordById, insertRecord, onError, sql, updateRecord } from "./db"
import { getExtTableName } from "~/util"

export const insertExtRecord = async (
  tableName: string,
  record: DataRecord,
  extTableName: string,
  extRecord: DataRecord
) => {
  const result = await insertRecord(tableName, record)
  if (result && result.length > 0) {
    await insertRecord(extTableName, {id: result[0].id, ...extRecord})
  }
}

export const updateExtRecord = (
  tableName: string,
  id: string,
  record: DataRecord,
  extTableName: string,
  extRecord: DataRecord
) => Promise.all([
  updateRecord(tableName, id, record),
  updateRecord(extTableName, id, extRecord),
]).catch(onError)

export const getExtRecordById = async (tableName: string, id: string | number) => {
  const result = await getRecordById(tableName, id)
  if (!result) return

  const extTableName = getExtTableName(tableName, result)
  if (extTableName) {
    const extResult = await getRecordById(extTableName, id)
    return {...result, ...extResult}
  } else {
    return result
  }
}

export const deleteExtById = async (tableName: string, id: string) => {
  const result = await getRecordById(tableName, id)
  if (!result) return
  const extTableName = getExtTableName(tableName, result)
  await deleteById(tableName, id)
  if (extTableName) {
    await deleteById(extTableName, id)
  }
}