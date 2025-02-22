import { AuthRole } from "~/types"
import { sql } from "../../server-only/db"

// TODO: extablish a chain of invites via expl records

export const join = async (name: string, code: string) => {
  "use server"
  const invites = await sql`
    SELECT *
    FROM invite
    WHERE code = ${code}
      AND person_id IS NULL
    LIMIT 1
  `
  if (invites?.[0]) {
    const invite = invites[0]

    const authRoleName: AuthRole = 'invited'
    const authRoles = await sql`
      SELECT id 
      FROM auth_role 
      WHERE name = ${authRoleName} 
      LIMIT 1
    `
    const authRole = authRoles?.[0]

    if (authRole) {
      const persons = await sql`
        INSERT INTO person ${sql({
          name,
          email: '',
          password: '',
          auth_role_id: authRole.id
        })}
        RETURNING *
      `
      if (persons?.[0]) {
        const person = persons[0]
        await sql`
          UPDATE invite
          SET person_id = ${person.id}
          WHERE id = ${invite.id}
        `
        return person.id
      }
    }
  }
}
