import { sql } from "~/server-only/db"
import { ExplRecord } from "~/server-only/expl"


export const listUserActivity = async (
  userId: number
) => {
  "use server"
  const activity = await sql<ExplRecord<any>[]>`
    SELECT *
    FROM expl 
    WHERE user_id = ${userId}
    ORDER BY id DESC
  `
  return activity
}