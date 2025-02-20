"use server";

import { _deleteById } from "../../server-only/mutate"
import { _getRecordById } from "../../server-only/select"
import { getExtTableName } from "~/util"

export const deleteExtById = async (tableName: string, id: number) => {
  const result = await _getRecordById(tableName, id, ['id'])
  if (!result) return
  const extTableName = getExtTableName(tableName, result)
  await _deleteById(tableName, id)
  if (extTableName) {
    await _deleteById(extTableName, id)
  }
}