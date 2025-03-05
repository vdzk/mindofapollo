import { DataRecordWithId } from "~/schema/type";
import { onError, sql } from "~/server-only/db";

export const _getCreatedCriticalStatement = async (
  userId: number,
  argumentId: number
) => {
  const result = await sql`
    SELECT cs.*
    FROM critical_statement cs
    JOIN expl
      ON expl.id = cs.id_expl_id
    WHERE cs.argument_id = ${argumentId}
      AND expl.user_id = ${userId}
    LIMIT 1
  `.catch(onError)
  return result?.[0] as DataRecordWithId | undefined
}