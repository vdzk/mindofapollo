"use server"

import {sql} from "~/server-only/db"
import { getUserSession } from "./session"

export const hasArguments = async (statementId: number) => {
  const userSession = await getUserSession()
  const result = await sql`
    SELECT id
    FROM argument
    WHERE statement_id = ${statementId}
    LIMIT 1
  `
  return result.length > 0
}

export const hasUnjudgedArguments = async (statementId: number) => {
  const userSession = await getUserSession()
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
}
