"use server"

import { sql } from "./db"
import { safeWrap } from "./mutate.db"
import { writeHistory } from "./serverOnly"

export const getjudgeargument = safeWrap(async (userId) => {
  const result = await sql`
    SELECT argument.id, argument.title
    FROM argument
    ORDER BY random()
    LIMIT 1
  `
  return result[0]
})

export const addConfirmation = safeWrap(async (
  userId: number,
  questionId: number
) => {
  "use server"
  const result = await sql`
    INSERT INTO confirmation (id, count)
    VALUES (${questionId}, 1)
    ON CONFLICT (id)
    DO UPDATE SET count = confirmation.count + 1
    RETURNING *
  `
  const record = result[0]
  const count = record.count as number
  await writeHistory(
    userId, count === 1 ? 'INSERT' : 'UPDATE', 'confirmation', record)
  return count
})