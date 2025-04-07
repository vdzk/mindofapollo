import { _updateUserSession, getUserId } from "~/server-only/session"

export const updateUserSession = async () => {
  "use server"
  const userId = await getUserId()
  return _updateUserSession(userId)
}