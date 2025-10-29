import { onError, sql } from "./db"
import { getAuthRole } from "./session"

export const canReviseOwnRecentEntry = async (
  userId: number,
  tableName: string,
  recordId: number
) => {
  const authRole = await getAuthRole()
  if (authRole === 'admin') return true
  if (tableName === 'person' && recordId === userId) return true
  
  const result = await sql`
    SELECT 1
    FROM expl
    WHERE user_id = ${userId}
      AND action = 'insertRecord'
      AND table_name = ${tableName}
      AND record_id  = ${recordId}
      AND timestamp > NOW() - INTERVAL '24 hours'; 
  `.catch(onError)
  
  return result.length > 0
}