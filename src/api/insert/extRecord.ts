import { DataRecord, DataRecordWithId } from "~/schema/type"
import { _insertRecord } from "../../server-only/mutate"
import { setExplRecordId, startExpl, finishExpl } from "~/server-only/expl"
import { getUserId, getUserActorUser } from "../../server-only/session"
import { ExplData, UserActor } from "~/components/expl/types"
import { titleColumnName } from "~/utils/schema"
import { _getRecordById } from "~/server-only/select"
import { whoCanInsertRecord } from "./record"

export const whoCanInsertExtRecord = whoCanInsertRecord

export const insertExtRecord = async (
  tableName: string,
  record: DataRecord,
  extTableName: string,
  extRecord: DataRecord
) => {
  "use server";
  const userId = await getUserId()
  const explId = await startExpl(userId, 'insertExtRecord', 1, tableName, null);
  const result = await _insertRecord(tableName, record, explId)
  const { id } = result
  const savedRecord = await _getRecordById(tableName, id)
  if (!savedRecord) return
  const extResult = await _insertRecord(extTableName, {id, ...extRecord}, explId)
  await setExplRecordId(explId, id)

  const user = await getUserActorUser()
  const data: InsertExtRecordData = {
    tableName,
    extTableName,
    record: savedRecord,
    extRecord: extResult!,
    user,
    targetLabel: savedRecord[titleColumnName(tableName)] as string
  }
  await finishExpl(explId, data)
  return savedRecord
}

export interface InsertExtRecordData {
  tableName: string
  extTableName: string
  record: DataRecordWithId
  extRecord: DataRecordWithId
  user: UserActor['user']
  targetLabel: string
}

export const explInsertExtRecord = (data: InsertExtRecordData): ExplData => ({
  actor: { type: 'user', user: data.user },
  action: 'created',
  target: {
    tableName: data.tableName,
    id: data.record.id,
    label: data.targetLabel
  },
  insertedRecords: {
    [data.tableName]: [data.record],
    [data.extTableName]: [data.extRecord]
  }
})