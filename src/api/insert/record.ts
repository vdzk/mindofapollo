import { belongsTo, getAuthRole, getUserId, getUserActorUser } from "~/server-only/session"
import { DataRecord, DataRecordWithId } from "~/schema/type"
import { setExplRecordId, startExpl, finishExpl } from "~/server-only/expl"
import { _insertRecord, injectValueTypes } from "~/server-only/mutate"
import { ExplData, UserActor } from "~/components/expl/types"
import { titleColumnName } from "~/util"

export const whoCanInsertRecord = (tableName: string) => {
  if (tableName === 'person') {
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
  const authRole = await getAuthRole()

  // Prevent inserting records of others
  const { owner_id } = record
  if (owner_id && owner_id !== userId && authRole !== 'admin') return
    
  await injectValueTypes(tableName, record);
  const explId = await startExpl(userId, 'genericChange', 1, tableName, null)
  const result = await _insertRecord(tableName, record, explId);
  await setExplRecordId(explId, result.id)

  const user = await getUserActorUser()
  const data: InsertRecordData = {
    tableName,
    record: result,
    user,
    targetLabel: result[titleColumnName(tableName)] as string
  }
  await finishExpl(explId, data)

  return [result]
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