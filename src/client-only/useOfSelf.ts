import { useContext } from "solid-js"
import { DataRecord } from "~/schema/type"
import { SessionContext } from "~/SessionContext"
import { hasOwner } from "~/permissions"

export const useOfSelf = (tableName: string, record?: DataRecord) => {
  const session = useContext(SessionContext)
  if (!hasOwner(tableName)) return false
  if (!record?.owner_id) return false
  const userId = session?.userSession()?.userId
  return record.owner_id === userId
}