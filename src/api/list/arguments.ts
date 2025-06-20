import { DataRecordWithId } from "~/schema/type"
import { onError, sql } from "~/server-only/db"
import { injectTranslations } from "~/server-only/injectTranslations"


export const listArguments = async (statementId: number) => {
  "use server"

  const records = await sql<DataRecordWithId[]>`
    SELECT a.id, pro, isolated_confidence, conditional_confidence,
           COALESCE(cs_count.count, 0)::integer as critical_statements_count
    FROM argument a
    LEFT JOIN argument_judgement aj ON aj.id = a.id
    LEFT JOIN argument_conditional ac ON ac.id = a.id
    LEFT JOIN (
      SELECT argument_id, COUNT(*)::integer as count 
      FROM critical_statement 
      GROUP BY argument_id
    ) cs_count ON cs_count.argument_id = a.id
    WHERE statement_id = ${statementId}
    ORDER BY id
  `.catch(onError)
  await injectTranslations('argument', records, ['title'])

  return records
}