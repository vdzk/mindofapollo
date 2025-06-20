import { ofSelf } from "~/server-only/ofSelf";
import { whoCanGetOneRecordById } from "./recordById"
import { _getRecordById } from "~/server-only/select";

export const whoCanGetOneRecordByChildId = whoCanGetOneRecordById

export const getOneRecordByChildId = async (tableName: string, childTableName: string, childId: number) => {
  "use server"
  const childRecord = await _getRecordById(childTableName, childId)
  if (!childRecord) return
  const parentId = childRecord[`${tableName}_id`] as number
  if (!parentId) return
  const _ofSelf = await ofSelf(tableName, parentId)
  if (! await whoCanGetOneRecordByChildId(tableName, _ofSelf)) return
  return _getRecordById(tableName, parentId)
};