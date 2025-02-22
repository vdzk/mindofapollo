import { _deleteById } from "../../server-only/mutate"
import { _getRecordById } from "../../server-only/select"
import { getExtTableName } from "~/util"
import { whoCanDeleteById } from "./byId"
import { belongsTo } from "~/server-only/session"
import { ofSelf } from "~/server-only/ofSelf"

export const whoCanDeleteExtById = whoCanDeleteById

export const deleteExtById = async (tableName: string, id: number) => {
  "use server"
  if (! await belongsTo(whoCanDeleteExtById(
    tableName,
    await ofSelf(tableName, id)
  ))) return
  
  const result = await _getRecordById(tableName, id, ['id'])
  if (!result) return
  const extTableName = getExtTableName(tableName, result)
  await _deleteById(tableName, id)
  if (extTableName) {
    await _deleteById(extTableName, id)
  }
}