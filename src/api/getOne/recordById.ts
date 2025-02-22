import { belongsTo, getAuthRole } from "~/server-only/session"
import { getReadableColNames, isPrivate } from "~/permissions";
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
  if (! await belongsTo(whoCanGetOneRecordById(
    tableName, await ofSelf(tableName, id)
  ))) return
  const colNames = getReadableColNames(tableName, await getAuthRole())
  return _getRecordById(tableName, id, colNames)
};