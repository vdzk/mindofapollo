"use server"
import { onError, sql } from "~/db";
import { Id } from "~/types";

export const _getCreatedCriticalStatement = async (
  userId: number,
  argumentId: Id
) => {
  const result = await sql`
    SELECT cs.id, cs.id_expl_id
    FROM critical_statement cs
    JOIN expl
      ON expl.id = cs.id_expl_id
    WHERE cs.argument_id = ${argumentId}
      AND expl.user_id = ${userId}
    LIMIT 1
  `.catch(onError)
  return result?.[0]
}