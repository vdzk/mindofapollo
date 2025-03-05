import { onError, sql } from "~/server-only/db";
import { getUserSession } from "~/server-only/session";

export const listChatMessages = async () => {
  "use server";
  const userSession = await getUserSession();
  if (!userSession?.authenticated) return [];
  const messages = await sql`
    SELECT m.id, m.text, m.user_id, m.timestamp, p.name as sender_name
    FROM chat_message m
    JOIN person p ON p.id = m.user_id
    ORDER BY m.timestamp DESC
    LIMIT 100
  `.catch(onError);
  return messages || [];
};
