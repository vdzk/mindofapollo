import { DataRecord } from "~/schema/type"
import { _insertRecord } from "../../server-only/mutate"
import { setExplRecordId, startExpl } from "~/server-only/expl"
import { getUserSession } from "../../server-only/session"

export const insertExtRecord = async (
  tableName: string,
  record: DataRecord,
  extTableName: string,
  extRecord: DataRecord
) => {
  "use server";
  const userSession = await getUserSession()
  const explId = await startExpl(userSession.userId, 'genericChange', 1, tableName, null);
  const result = await _insertRecord(tableName, record, explId)
  if (result) {
    await _insertRecord(extTableName, {id: result.id, ...extRecord}, explId)
    await setExplRecordId(explId, result.id)
  }
  return result
}