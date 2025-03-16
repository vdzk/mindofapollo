import { isPersonal } from "~/permissions";
import { DataRecordWithId } from "~/schema/type";
import { onError, sql } from "~/server-only/db"
import { injectVirtualValues } from "~/server-only/select"
import { getUserId } from "~/server-only/session";
import { injectTranslations } from "~/server-only/injectTranslations";

export const listRecords = async (tableName: string) => {
  "use server"
  const whereClause = isPersonal(tableName)
    ? sql`WHERE owner_id = ${await getUserId()}`
    : sql``  
  const records = await sql`
    SELECT t.*
    FROM ${sql(tableName)} t
    ${whereClause}
    ORDER BY t.id
  `.catch(onError)
  await injectTranslations(tableName, records)
  await injectVirtualValues(tableName, records)
  return records as unknown as DataRecordWithId[]
};