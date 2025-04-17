import { isPersonal } from "~/permissions";
import { DataRecordWithId } from "~/schema/type";
import { onError, sql } from "~/server-only/db"
import { injectVirtualValues } from "~/server-only/select"
import { getUserId } from "~/server-only/session";
import { injectTranslations } from "~/server-only/injectTranslations";
import { schema } from "../../schema/schema";

export const listRecords = async (
  tableName: string,
  childStatementId?: number | null,
  ids?: number[]
) => {
  "use server"
  let filterClause
  let selectClause = sql`t.*`
  if (isPersonal(tableName) && (schema.tables[tableName].private ?? true)) {
    filterClause = sql`WHERE owner_id = ${await getUserId()}`
  } else if (childStatementId && tableName === 'statement') {
    selectClause = sql`t.*, cs.argument_id`
    filterClause = sql`
      JOIN argument a ON a.statement_id = t.id
      JOIN critical_statement cs ON cs.argument_id = a.id
      WHERE cs.statement_id = ${childStatementId}
    `
  } else if (ids && ids.length > 0) {
    filterClause = sql`WHERE t.id IN ${sql(ids)}`
  } else {
    filterClause = sql``
  }  
  const records = await sql`
    SELECT ${selectClause}
    FROM ${sql(tableName)} t
    ${filterClause}
    ORDER BY t.id
  `.catch(onError)
  await injectTranslations(tableName, records)
  await injectVirtualValues(tableName, records)
  return records as unknown as DataRecordWithId[]
}