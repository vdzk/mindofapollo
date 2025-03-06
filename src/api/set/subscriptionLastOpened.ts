import { onError, sql } from "~/server-only/db"
import { getUserId } from "~/server-only/session"

export const updateSubscriptionLastOpened = async (statementId: number) => {
  'use server'
  const userId = await getUserId()
  if (!userId) return false
  
  await sql`
    UPDATE subscription
    SET last_opened = CURRENT_TIMESTAMP
    WHERE person_id = ${userId}
      AND statement_id = ${statementId}
  `.catch(onError)
  
  return true
}
