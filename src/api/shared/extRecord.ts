"use server";

import { DataRecord } from "~/schema/type"
import { onError } from "../../db"
import { deleteById } from "./mutate";
import { getRecordById, getValueById } from "~/api/shared/select";
import { insertRecord, updateRecord } from "./mutate";
import { getExtTableName } from "~/util"
import { schema } from "~/schema/schema";
import { getValueTypeTableNameByColType } from "~/schema/dataTypes";
import { getTypeByRecordId } from "./valueType";
import { Id } from "~/types";

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
