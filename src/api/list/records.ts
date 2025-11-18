import { hasOwner } from "~/permissions";
import { DataRecordWithId } from "~/schema/type";
import { onError, sql } from "~/server-only/db"
import { injectVirtualValues } from "~/server-only/select"
import { getUserId } from "~/server-only/session";
import { injectTranslations } from "~/server-only/injectTranslations";
import { schema } from "../../schema/schema";

export const listRecords = async (
  tableName: string
) => {
  "use server"
  let filterClause
  let selectClause = sql`t.*`
  if (hasOwner(tableName) && (schema.tables[tableName].private ?? true)) {
    const userId = await getUserId()
    if (!userId) return []
    filterClause = sql`WHERE owner_id = ${await getUserId()}`
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