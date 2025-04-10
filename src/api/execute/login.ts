import { _getRecordById } from "~/server-only/select"
import { _updateUserSession } from "~/server-only/session"
import bcrypt from "bcryptjs"
import { onError, sql } from "~/server-only/db";

export const login = async (email: string, password: string) => {
  "use server"
  const results = await sql`
    SELECT user_id, password_hash
    FROM personal_details
    WHERE email = ${email}
    LIMIT 1
  `.catch(onError)
  const [ personalDetails ] = results
  if (!personalDetails) return
  if (!bcrypt.compareSync(password, personalDetails.password_hash)) return
  return _updateUserSession(personalDetails.user_id)
};
