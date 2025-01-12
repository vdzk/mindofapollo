"use server"

import { onError, sql } from "../../db"
import { writeHistory } from "../shared/mutate"

export const join = async (name: string, code: string) => {
  const invites = await sql`
    SELECT *
    FROM invite
    WHERE code = ${code}
      AND person_id IS NULL
    LIMIT 1
  `.catch(onError)
  if (invites?.[0]) {
    const invite = invites[0]
    const persons = await sql`
      INSERT INTO person ${sql({name, email: '', password: ''})}
      RETURNING *
    `.catch(onError)
    if (persons?.[0]) {
      const person = persons[0]
      await writeHistory(person.id, 'INSERT', 'person', person)
      const results = await sql`
        UPDATE invite
        SET person_id = ${person.id}
        WHERE id = ${invite.id}
        RETURNING *
      `
      await writeHistory(person.id, 'UPDATE', 'invite', results[0])
      return person.id
    }
  }
}
