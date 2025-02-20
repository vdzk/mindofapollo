"use server"

import { sql } from "~/server-only/db"
import { _updateRecord } from "~/server-only/mutate"
import { startExpl } from "~/server-only/expl"
import { getUserSession } from "~/server-only/session"

export const submitTaskConfirmOrChallenge = async (
  statementId: number
) => {
  const userSession = await getUserSession()
  // TODO: check permissions
  const result = await sql`
    INSERT INTO confirmation (id, count)
    VALUES (${statementId}, 1)
    ON CONFLICT (id)
    DO UPDATE SET count = confirmation.count + 1
    RETURNING *
  `
  const record = result[0]
  const count = record.count as number
  // TODO: make this number dynamic, depending on the number of users
  if (count >= 2) {
    const explId = await startExpl(userSession.userId, 'genericChange', 1, 'statement', statementId);
    await _updateRecord('statement', statementId, explId, {       
      decided: true,       
      confidence: 1     
    })
  }
  return record
}