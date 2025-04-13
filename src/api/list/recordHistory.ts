import { personalTableNames } from "~/permissions"
import { onError, sql } from "~/server-only/db"
import { ExplRecord } from "~/server-only/expl"

export const listRecordHistory = async (
  tableName: string,
  recordId: number
) => {
  "use server"
  if (personalTableNames().includes(tableName)) return []
  const history = await sql<ExplRecord<any>[]>`
    SELECT *
    FROM expl 
    WHERE table_name = ${tableName}
      AND record_id = ${recordId}
    ORDER BY id DESC
  `.catch(onError)
  return history
}