import { getUserSession } from "~/server-only/session"

export const getOneUserSession = async () => {
  "use server"
  return await getUserSession()
}