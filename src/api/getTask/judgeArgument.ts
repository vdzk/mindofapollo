"use server"

import {sql} from "~/server-only/db"
import { getUserSession } from "~/server-only/session"

export const getTaskJudgeArgument = async () => {
  const userSession = await getUserSession()
  const result = await sql`
    SELECT argument.id, argument.title, argument.statement_id,
           statement.text as statement_text
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
  `
  return result[0]
}