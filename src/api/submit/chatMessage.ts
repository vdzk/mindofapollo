import { onError, sql } from "~/server-only/db"
import { allowedTextContent } from "~/server-only/moderate";
import { getUserSession } from "~/server-only/session"

export const submitChatMessage = async (text: string) => {
  "use server";
  const userSession = await getUserSession()
  if (!userSession?.authenticated) return null
  if (! await allowedTextContent(text)) return null 
  const currentTimestamp = Math.floor(Date.now() / 1000)
  const result = await sql`
    INSERT INTO chat_message (text, user_id, timestamp)
    VALUES (${text}, ${userSession.userId}, ${currentTimestamp})
    RETURNING id, text, user_id, timestamp
  `.catch(onError)
  return result?.[0] || null
};
