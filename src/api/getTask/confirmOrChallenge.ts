import { DataRecordWithId } from "~/schema/type"
import { onError, sql } from "~/server-only/db"
import { getUserId } from "~/server-only/session"
import { injectTranslations } from "~/server-only/translation"

export const getTaskConfirmOrChallenge = async () => {
  "use server"
  const userId = await getUserId()
  // TODO: use TABLESAMPLE when the table grows enough
  // TODO: exclude statements created by the user
  // TODO: avoid sniping by ...
  // TODO: excluding recent statements up to a random time limit
  // TODO: issuing a token to prove that the statement was selected randomly
  //       Confirm that this avoids bypassing existance of con arguments
  // TODO: rate limiting for a single user
  // + what if the intent of creator of the statement was never to ask for confirmation by random sampling. Make marking for random sampling explicit with a flag?
  // TODO: Check behaviour for anonymous user

  const results = await sql<DataRecordWithId[]>`
    SELECT statement.id
    FROM statement
    LEFT JOIN argument
      ON statement.id = argument.statement_id
      AND argument.pro = false
    LEFT JOIN expl
      ON statement.id = expl.record_id
      AND expl.table_name = 'statement'
      AND expl.user_id = ${userId}
      AND expl.action = 'submitTaskConfirmOrChallenge'
    WHERE NOT decided 
      -- exclude statements with con arguments
      AND argument.statement_id IS NULL
      -- exclude statements that the user has already confirmed
      AND expl.id IS NULL
    ORDER BY random()
    LIMIT 1
  `.catch(onError)
  await injectTranslations('statement', results, ['text'])
  return results[0]
}