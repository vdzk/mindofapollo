import { DataRecordWithId } from "~/schema/type"
import { onError, sql } from "~/server-only/db"

export const getTaskJudgeCorrelations = async () => {
  "use server"
  const sides = Math.random() > 0.5 ? [true, false] : [false, true]
  let data: { pro: boolean, statement: DataRecordWithId } | undefined
  for (const pro of sides) {
    const result = await sql`
      SELECT s.*
      FROM statement s
      JOIN argument a ON s.id = a.statement_id
      LEFT JOIN argument_conditional ac ON a.id = ac.id
      WHERE s.judgement_requested = true
        AND EXISTS (
          SELECT 1 FROM argument_aggregation_type aat 
          WHERE aat.id = s.argument_aggregation_type_id 
          AND aat.name = 'evidential'
        )
        AND a.pro = ${pro}
        AND ac.id IS NULL
      GROUP BY s.id
      HAVING COUNT(a.id) >= 2
      ORDER BY RANDOM()
      LIMIT 1;
    `.catch(onError)
    if (result.length > 0) {
      data = { statement: result[0] as DataRecordWithId, pro }
      break
    }
  }
  if (data) {
    const results = await sql`
      SELECT *
      FROM argument
      JOIN argument_judgement
        ON argument_judgement.id = argument.id
      WHERE statement_id = ${data.statement.id}
        AND pro = ${data.pro}
      ORDER BY argument_judgement.isolated_confidence DESC
    `.catch(onError) as DataRecordWithId[]
    return { ...data, arguments: results }
  }
}