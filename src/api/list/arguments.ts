import { DataRecordWithId } from "~/schema/type"
import { onError, sql } from "~/server-only/db"
import { injectTranslations } from "~/server-only/injectTranslations"
import { _getRecordById } from "~/server-only/select"

export const listArguments = async (statementId: number) => {
  "use server"
  const statement = await _getRecordById('statement', statementId, ['statement_type_name'])
  let _arguments:DataRecordWithId[] = []
  if (!statement) return
  if (statement.statement_type_name === 'threshold') {
    _arguments = await sql<DataRecordWithId[]>`
      SELECT a.id, pro, weight_lower_limit, weight_mode, weight_upper_limit
      FROM argument a
      LEFT JOIN argument_weight aw ON aw.id = a.id
      WHERE statement_id = ${statementId}
      ORDER BY id
    `.catch(onError)
  } else {
    _arguments = await sql<DataRecordWithId[]>`
      SELECT a.id, pro, strength,
            isolated_confidence, conditional_confidence,
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
  }
  await injectTranslations('argument', _arguments, ['title'])

  return {
    statement_type_name: statement.statement_type_name,
    arguments: _arguments
  }
}