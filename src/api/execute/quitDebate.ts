import { onError, sql } from "~/server-only/db"
import { _updateRecord } from "~/server-only/mutate"
import { _getRecordById } from "~/server-only/select"
import { getUserId } from "~/server-only/session"

export const quitDebate = async (id: number) => {
  "use server";
  const userId = await getUserId()
  if (!userId) return
  const debate = await _getRecordById('debate', id, ['creator_id', 'taker_id'])
  if (typeof debate.creator_won === 'boolean') return
  const isCreator = userId === debate.creator_id
  const isTaker = userId === debate.taker_id
  if (!(isCreator || isTaker)) return
  await sql`
    UPDATE debate
    SET creator_won = ${isTaker}
    WHERE id = ${id}
  `.catch(onError)
}