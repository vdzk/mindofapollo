import { personalTableNames } from "~/permissions"
import { onError, sql } from "~/server-only/db"
import { ExplRecord } from "~/server-only/expl"


export const listUserActivity = async (
  userId: number
) => {
  "use server"
  const activity = await sql<ExplRecord<any>[]>`
    SELECT *
    FROM expl 
    WHERE user_id = ${userId}
      AND table_name NOT IN ${sql(personalTableNames)}
    ORDER BY id DESC
  `.catch(onError)
  return activity
}