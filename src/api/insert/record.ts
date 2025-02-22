import { belongsTo, getAuthRole, getUserId } from "~/server-only/session"
import { DataRecord } from "~/schema/type"
import { setExplRecordId, startExpl } from "~/server-only/expl"
import { _insertRecord, injectValueTypes } from "~/server-only/mutate"

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
  return [result]
};