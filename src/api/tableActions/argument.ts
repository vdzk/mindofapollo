"use server"
import {safeWrap} from "~/api/shared/mutate";
import {sql} from "~/db";

export const addedCriticalStatement = safeWrap(async (userId, argumentId: number) => {
    const result = await sql`
    SELECT csh.id
    FROM critical_statement_h csh
    LEFT JOIN argument a
      ON csh.argument_id = a.id
      AND a.judgement_requested = true
    WHERE csh.argument_id = ${argumentId}
      AND csh.op_user_id = ${userId}
      AND csh.data_op = 'INSERT'
      AND a.id IS NULL
    LIMIT 1
  `
    return result.length > 0
})
