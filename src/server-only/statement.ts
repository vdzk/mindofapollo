import {onError, sql} from "~/server-only/db"

export const hasArguments = async (statementId: number) => {
  const result = await sql`
    SELECT id
    FROM argument
    WHERE statement_id = ${statementId}
    LIMIT 1
  `.catch(onError)
  return result.length > 0
}

export const hasUnjudgedArguments = async (statementId: number) => {
  const result = await sql`
    SELECT id
    FROM argument
    WHERE statement_id = ${statementId}
      AND ( NOT EXISTS (
        SELECT 1
        FROM argument_judgement
        WHERE argument_judgement.id = argument.id
      ))
    LIMIT 1
  `.catch(onError)
  return result.length > 0
}
