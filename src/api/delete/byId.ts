import { belongsTo } from "~/server-only/session"
import { _deleteById } from "../../server-only/mutate"
import { isPersonal } from "~/permissions"
import { ofSelf } from "~/server-only/ofSelf"

export const whoCanDeleteById = (tableName: string, ofSelf: boolean) => {
  if ( tableName === 'person' || (isPersonal(tableName) && !ofSelf)) {
    return []
  } else {
    return ['invited']
  }
}

export const deleteById = async (
  tableName: string,
  id: number
) => {
  "use server"
  if (! await belongsTo(whoCanDeleteById(
    tableName,
    await ofSelf(tableName, id)
  ))) return

  return await _deleteById(tableName, id)
};