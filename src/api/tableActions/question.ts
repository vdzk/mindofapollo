"use server"
import {safeWrap} from "~/api/shared/mutate";
import {sql} from "~/db";

export const hasArguments = safeWrap(async (userId, questionId: number) => {
    const result = await sql`
    SELECT id
    FROM argument
    WHERE question_id = ${questionId}
    LIMIT 1
  `
    return result.length > 0
})

export const hasUnjudgedArguments = safeWrap(async (userId, questionId: number) => {
    const result = await sql`
    SELECT id
    FROM argument
    WHERE question_id = ${questionId}
      AND ( judgement_requested  OR NOT EXISTS (
        SELECT 1
        FROM argument_judgement
        WHERE argument_judgement.id = argument.id
      ))
    LIMIT 1
  `
    return result.length > 0
})
