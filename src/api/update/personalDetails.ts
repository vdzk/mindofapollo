import bcrypt from "bcryptjs"
import { onError, sql } from "~/server-only/db"
import { getUserId } from "~/server-only/session"

export const updatePersonalDetails = async (
  email: string,
  password: string
) => {
  "use server"
  const userId = await getUserId()
  if (!userId) return
  const hash = bcrypt.hashSync(password, 10)
  sql`
    UPDATE personal_details
    SET email = ${email}, password_hash = ${hash}
    WHERE user_id = ${userId}
  `.catch(onError)
  return
}