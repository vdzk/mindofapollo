import { _setSubscription } from "~/server-only/notifications"
import { getUserId } from "~/server-only/session"

export const setSubscription = async (statementId: number, subscribe: boolean) => {
  'use server'
  const userId = await getUserId()
  if (!userId) return
  await _setSubscription(userId, [statementId], subscribe, true)
}