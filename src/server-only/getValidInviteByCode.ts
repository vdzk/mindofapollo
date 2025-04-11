import { onError, sql } from "./db"

export const getValidInviteByCode = async (code: string) => {
  "use server"
  const invites = await sql`
    SELECT id, owner_id
    FROM invite
    WHERE code = ${code}
      AND person_id IS NULL
    LIMIT 1
  `.catch(onError)
  return invites[0] ? invites[0] : null
}