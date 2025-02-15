"use server"
import {safeWrap} from "~/api/shared/mutate";
import {sql} from "~/db";
import { UserSession } from "~/types";

export const hasArguments = safeWrap(async (userSession: UserSession, statementId: number) => {
    const result = await sql`
    SELECT id
    FROM argument
    WHERE statement_id = ${statementId}
    LIMIT 1
  `
    return result.length > 0
})

export const hasUnjudgedArguments = safeWrap(async (userSession: UserSession, statementId: number) => {
    const result = await sql`
    SELECT id
    FROM argument
    WHERE statement_id = ${statementId}
      AND ( judgement_requested  OR NOT EXISTS (
        SELECT 1
        FROM argument_judgement
        WHERE argument_judgement.id = argument.id
      ))
    LIMIT 1
  `
    return result.length > 0
})
