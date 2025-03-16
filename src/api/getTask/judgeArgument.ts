import { DataRecordWithId } from "~/schema/type"
import {onError, sql} from "~/server-only/db"
import { getUserSession } from "~/server-only/session"
import { injectTranslations } from "~/server-only/translation"

export const getTaskJudgeArgument = async () => {
  "use server"
  const userSession = await getUserSession()
  const result = await sql<DataRecordWithId[]>`
    SELECT argument.id, argument.statement_id
    FROM argument
    JOIN statement ON statement.id = argument.statement_id
    JOIN expl ON expl.id = argument.id_expl_id
    WHERE argument.judgement_requested
      AND NOT EXISTS (
        SELECT 1
        FROM argument_judgement
        WHERE argument_judgement.id = argument.id
      )
      AND expl.user_id != ${userSession.userId}
    ORDER BY random()
    LIMIT 1
  `.catch(onError)
  
  await injectTranslations(
    'argument', result, null, [
      {
        tableName: 'statement',
        recordIdColName: 'statement_id',
        columnName: 'text',
        resultColName: 'statement_text'
      }
    ]
  )
  
  return result[0]
}