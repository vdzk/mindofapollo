"use server"

import { sql } from "./db"
import {safeWrap, writeHistory} from "./mutate.db"

export const getConfirnmationQuestion = safeWrap(async (userId) => {
  "use server"
  // TODO: use TABLESAMPLE when the table grows enough
  // TODO: exclude answers created by the user
  // TODO: avoid sniping by ...
  // TODO: excluding recent answers up to a random time limit
  // TODO: issuing a token to prove that the question was selected randomly
  //       Confirm that this avoids bypassing existance of con arguments
  // TODO: rate limiting for a single user
  // + what if the intent of creator of the statement was never to ask for confirmation by random sampling. Make marking for random sampling explicit with a flag?
  // TODO: Check behaviour for anonymous user

  const results = await sql`
    SELECT question.id, question.answer
    FROM question
    LEFT JOIN argument
      ON question.id = argument.question_id
      AND argument.pro = false
    LEFT JOIN confirmation_h
      ON question.id = confirmation_h.id
      AND confirmation_h.op_user_id = ${userId}
    WHERE NOT decided 
      AND answer != ''
      -- exclude questions with con arguments
      AND argument.question_id IS NULL
      -- exclude questions that the user has already confirmed
      AND confirmation_h.id IS NULL
    ORDER BY random()
    LIMIT 1
  `
  return results[0]
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
