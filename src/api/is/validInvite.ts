import { getValidInviteByCode } from "~/server-only/getValidInviteByCode"

export const isValidInvite = async (code: string) => {
  "use server"
  return !!(await getValidInviteByCode(code))
}