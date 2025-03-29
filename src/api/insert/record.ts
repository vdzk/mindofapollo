import { belongsTo, getUserId, getUserActorUser } from "~/server-only/session"
import { DataRecord, DataRecordWithId } from "~/schema/type"
import { setExplRecordId, startExpl, finishExpl } from "~/server-only/expl"
import { _insertRecord, injectValueTypes } from "~/server-only/mutate"
import { ExplData, UserActor } from "~/components/expl/types"
import { needsExpl, titleColumnName } from "~/utils/schema"
import { isPersonal, tablesThatExtendByName } from "~/permissions"
import { _getRecordById } from "~/server-only/select"

export const whoCanInsertRecord = (tableName: string) => {
  if (tableName === 'person' || tablesThatExtendByName.includes(tableName)) {
    return []
  } else {
    return ['invited']
  }
}

export const insertRecord = async (
  tableName: string,
  record: DataRecord
) => {
  "use server"
  if (! await belongsTo(whoCanInsertRecord(tableName))) return
  const userId = await getUserId()

  if (isPersonal(tableName)) {
    record.owner_id = userId
  }
    
  await injectValueTypes(tableName, record)
  const explId = needsExpl(tableName)
    ? await startExpl(userId, 'insertRecord', 1, tableName, null)
    : null
  const result = await _insertRecord(tableName, record, explId)
  const savedRecord = await _getRecordById(tableName, result.id)
  if (!savedRecord || !explId) return
  await setExplRecordId(explId, savedRecord.id)

  const user = await getUserActorUser()
  const data: InsertRecordData = {
    tableName,
    record: savedRecord,
    user,
    targetLabel: savedRecord[titleColumnName(tableName)] as string
  }
  await finishExpl(explId, data)

  return savedRecord
}

export interface InsertRecordData {
  tableName: string
  record: DataRecordWithId
  user: UserActor['user']
  targetLabel: string
}

export const explInsertRecord = (data: InsertRecordData): ExplData => ({
  actor: { type: 'user', user: data.user },
  action: 'created',
  target: {
    tableName: data.tableName,
    id: data.record.id,
    label: data.targetLabel
  },
  insertedRecords: {
    [data.tableName]: [data.record]
  }
})