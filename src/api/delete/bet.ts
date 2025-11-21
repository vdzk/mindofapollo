import { onError, sql } from "~/server-only/db";
import { _getRecordById } from "~/server-only/select";
import { getUserId } from "~/server-only/session";

export const deleteBet = async (id: number) => {
  "use server";
  const userId = await getUserId()
  if (!userId) return
  const bet = await _getRecordById('bet', id, ['creator_id', 'taker_id'])
  if (bet.taker_id) return false
  if (bet.creator_id !== userId) return false
  await sql`
    DELETE FROM bet
    WHERE id = ${id}
  `.catch(onError)
}