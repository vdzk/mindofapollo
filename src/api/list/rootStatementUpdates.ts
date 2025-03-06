import { personalTableNames } from "~/permissions"
import { onError, sql } from "~/server-only/db"
import { ExplRecord } from "~/server-only/expl"
import { getUserId } from "~/server-only/session"

type ExplRecordWithIsNew<T> = ExplRecord<T> & { isNew: boolean }

export const listRootStatementUpdates = async (statementId: number) => {
  "use server"
  const userId = await getUserId()
  if (!userId) return []
  
  const updates = await sql<ExplRecordWithIsNew<any>[]>`
    SELECT e.*, 
      CASE 
        WHEN s.last_opened IS NULL THEN TRUE
        WHEN e.timestamp > s.last_opened THEN TRUE
        ELSE FALSE
      END as "is_new"
    FROM expl e
    JOIN root_statement_update rsu
      ON e.id = rsu.expl_id
    LEFT JOIN subscription s
      ON s.statement_id = rsu.statement_id
      AND s.person_id = ${userId}
    WHERE rsu.statement_id = ${statementId}
      AND e.table_name NOT IN ${sql(personalTableNames)}
      AND e.user_id != ${userId}
    ORDER BY e.id DESC
    LIMIT 100
  `.catch(onError)
  return updates
}
