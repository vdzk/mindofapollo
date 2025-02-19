"use server"

import { sql } from "../../server-only/db";
import { getUserSession } from "../../server-only/session";

export interface ChatMessage {
  id: number;
  text: string;
  user_id: number;
  sender_name: string;
  timestamp: number;
}

export const listChatMessages = async () => {
  const userSession = await getUserSession();
  if (!userSession?.authenticated) return [];

  const messages = await sql`
    SELECT m.id, m.text, m.user_id, m.timestamp, p.name as sender_name
    FROM chat_message m
    JOIN person p ON p.id = m.user_id
    ORDER BY m.timestamp DESC
    LIMIT 100
  `;

  return messages || [];
};

export const submitChatMessage = async (text: string) => {
  const userSession = await getUserSession();
  if (!userSession?.authenticated) return null;

  const currentTimestamp = Math.floor(Date.now() / 1000);

  const result = await sql`
    INSERT INTO chat_message (text, user_id, timestamp)
    VALUES (${text}, ${userSession.userId}, ${currentTimestamp})
    RETURNING id, text, user_id, timestamp
  `;

  return result?.[0] || null;
};