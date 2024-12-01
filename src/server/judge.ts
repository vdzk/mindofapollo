"use server"

import { sql } from "./db"
import { safeWrap } from "./mutate.db"

export const getJudgeArgument = safeWrap(async (userId) => {
  // TODO: postpone new entries for a random priod of time to avoid sniping? 
  const result = await sql`
    SELECT argument.id, argument.title
    FROM argument
    WHERE argument.judgement_requested
      AND NOT EXISTS (
        SELECT 1
        FROM argument_judgement
        WHERE argument_judgement.id = argument.id
      )
    ORDER BY random()
    LIMIT 1
  `
  return result[0]
})

export const addedCriticalStatement = safeWrap(async (userId, argumentId: number) => {
  const result = await sql`
    SELECT csh.id
    FROM critical_statement_h csh
    LEFT JOIN argument a
      ON csh.argument_id = a.id
      AND a.judgement_requested = true
    WHERE csh.argument_id = ${argumentId}
      AND csh.op_user_id = ${userId}
      AND csh.data_op = 'INSERT'
      AND a.id IS NULL
    LIMIT 1
  `
  return result.length > 0
})