import { onError, sql } from "~/server-only/db"

export const hasUndecidedCriticalStatement = async (argumentId: number) => {
  "use server";
  const criticalStatements = await sql<{id: number}[]>`
    SELECT statement_id
    FROM critical_statement
    JOIN statement ON statement_id = statement.id
    WHERE argument_id = ${argumentId}
      AND NOT statement.decided
    LIMIT 1
  `.catch(onError);
  return criticalStatements.length > 0;
}