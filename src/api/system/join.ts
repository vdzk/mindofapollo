"use server"

import { AuthorizationCategory } from "~/types"
import { sql } from "../../server-only/db"

export const join = async (name: string, code: string) => {
  const invites = await sql`
    SELECT *
    FROM invite
    WHERE code = ${code}
      AND person_id IS NULL
    LIMIT 1
  `
  if (invites?.[0]) {
    const invite = invites[0]

    const authCategoryName: AuthorizationCategory = 'invited'
    const authCategories = await sql`
      SELECT id 
      FROM authorization_category 
      WHERE name = ${authCategoryName} 
      LIMIT 1
    `
    const authCategory = authCategories?.[0]

    if (authCategory) {
      const persons = await sql`
        INSERT INTO person ${sql({
          name,
          email: '',
          password: '',
          authorization_category_id: authCategory.id
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
