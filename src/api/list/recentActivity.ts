import { personalTableNames } from "~/permissions"
import { onError, sql } from "~/server-only/db"
import { ExplRecord } from "~/server-only/expl"

export const listRecentActivity = async () => {
  "use server"
  const activity = await sql<ExplRecord<any>[]>`
    SELECT *
    FROM expl 
    WHERE table_name NOT IN ${sql(personalTableNames())}
    ORDER BY id DESC
    LIMIT 100
  `.catch(onError)
  return activity
}