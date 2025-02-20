import { getUserSession } from "~/server-only/session"
import { getPermission } from "~/getPermission"
import { DataRecord } from "~/schema/type"
import { setExplRecordId, startExpl } from "~/server-only/expl";
import { _insertRecord, injectValueTypes } from "~/server-only/mutate";

export const insertRecord = async (
  tableName: string,
  record: DataRecord
) => {
  "use server"
  const userSession = await getUserSession();
  if (!getPermission(userSession, 'create', tableName).granted) return;
  await injectValueTypes(tableName, record);
  const explId = await startExpl(userSession.userId, 'genericChange', 1, tableName, null);
  const result = await _insertRecord(tableName, record, explId);
  await setExplRecordId(explId, result.id);
  return [result];
};