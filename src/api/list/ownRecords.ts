import { DataRecordWithId } from "~/schema/type"
import { onError, sql } from "~/server-only/db"
import { injectTranslations } from "~/server-only/injectTranslations"
import { injectVirtualValues } from "~/server-only/select"
import { getUserId } from "~/server-only/session"

export const listOwnRecords = async (tableName: string) => {
  "use server"
  const userId = await getUserId()
  if (!userId) return []
  const records = await sql<DataRecordWithId[]>`
    SELECT *
    FROM ${sql(tableName)}
    WHERE owner_id = ${await getUserId()}
    ORDER BY id
  `.catch(onError)
  await injectTranslations(tableName, records)
  await injectVirtualValues(tableName, records)
  return records as unknown as DataRecordWithId[]
}