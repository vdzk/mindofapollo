import { _getRecordById } from "~/server-only/select"
import { _updateUserSession } from "~/server-only/session"
import bcrypt from "bcryptjs"

export const login = async (userId: number, password: string) => {
  "use server"
  if (!bcrypt.compareSync(password, process.env.PASSWORD_HASH!)) return
  return _updateUserSession(userId)
};
