import { onError, sql } from "~/server-only/db"
import { _updateRecord } from "~/server-only/mutate"
import { _getRecordById } from "~/server-only/select"
import { getUserId } from "~/server-only/session"

export const opposeBet = async (id: number) => {
  "use server";
  const userId = await getUserId()
  if (!userId) return
  const bet = await _getRecordById('bet', id, ['creator_id', 'taker_id'])
  if (bet.taker_id) return false
  if (bet.creator_id === userId) return false
  const curIsoDate = new Date().toISOString().split('T')[0]
  await sql`
    UPDATE bet
    SET
      taker_id = ${userId},
      start_date = ${curIsoDate}
    WHERE id = ${id}
  `.catch(onError)
}