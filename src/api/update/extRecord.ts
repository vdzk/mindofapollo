"use server";

import { DataRecord } from "~/schema/type"
import { _updateRecord } from "../../server-only/mutate"
import { startExpl } from "~/server-only/expl"
import { getUserSession } from "../../server-only/session"

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