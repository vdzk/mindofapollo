import { sql } from "~/server-only/db"
import { getUserSession } from "~/server-only/session"

export const getTaskConfirmOrChallenge = async () => {
  "use server"
  const userSession = await getUserSession()
  // TODO: use TABLESAMPLE when the table grows enough
  // TODO: exclude statements created by the user
  // TODO: avoid sniping by ...
  // TODO: excluding recent statements up to a random time limit
  // TODO: issuing a token to prove that the statement was selected randomly
  //       Confirm that this avoids bypassing existance of con arguments
  // TODO: rate limiting for a single user
  // + what if the intent of creator of the statement was never to ask for confirmation by random sampling. Make marking for random sampling explicit with a flag?
  // TODO: Check behaviour for anonymous user

  const results = await sql`
    SELECT statement.id, statement.text
    FROM statement
    LEFT JOIN argument
      ON statement.id = argument.statement_id
      AND argument.pro = false
    LEFT JOIN confirmation_h
      ON statement.id = confirmation_h.id
      AND confirmation_h.op_user_id = ${userSession.userId}
    WHERE NOT decided 
      -- exclude statements with con arguments
      AND argument.statement_id IS NULL
      -- exclude statements that the user has already confirmed
      AND confirmation_h.id IS NULL
    ORDER BY random()
    LIMIT 1
  `
  return results[0]
}