import { isPersonal } from "~/permissions"
import { getUserId } from "./session"
import { onError, sql } from "./db"

export const ofSelf = async (tableName: string, recordId: number) => {
  if (!isPersonal(tableName)) return false
  const userId = await getUserId()
  const result = await sql`
    SELECT 1
    FROM ${sql(tableName)}
    WHERE id = ${recordId}
      AND owner_id = ${userId}
    LIMIT 1
  `.catch(onError)
  return result.length === 1
}