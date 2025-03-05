import { belongsTo } from "~/server-only/session"
import { isPrivate } from "~/permissions";
import { _getRecordById } from "~/server-only/select";
import { ofSelf } from "~/server-only/ofSelf";

export const whoCanGetOneRecordById = (tableName: string, ofSelf: boolean) => {
  if (isPrivate(tableName) && !ofSelf) {
    return []
  } else {
    return ['invited']
  }
}

export const getOneRecordById = async (tableName: string, id: number) => {
  "use server"
  const _ofSelf = await ofSelf(tableName, id)
  if (! await belongsTo(whoCanGetOneRecordById(tableName, _ofSelf))) return
  return _getRecordById(tableName, id)
};