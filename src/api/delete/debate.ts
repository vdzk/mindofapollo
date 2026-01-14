import { onError, sql } from "~/server-only/db";
import { _getRecordById } from "~/server-only/select";
import { getUserId } from "~/server-only/session";

export const deleteDebate = async (id: number) => {
  "use server";
  const userId = await getUserId()
  if (!userId) return
  const debate = await _getRecordById('debate', id, ['creator_id', 'taker_id'])
  if (debate.taker_id) return false
  if (debate.creator_id !== userId) return false
  await sql`
    DELETE FROM debate
    WHERE id = ${id}
  `.catch(onError)
}