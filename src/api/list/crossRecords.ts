import { DataRecordWithId } from "~/schema/type";
import { onError, sql } from "~/server-only/db";
import { injectVirtualValues } from "~/server-only/select";
import { injectTranslations } from "~/server-only/injectTranslations";
import { getXTable } from "~/utils/schema";

export const listCrossRecords = async (
  b: string,
  a: string,
  id: number,
  first: boolean
) => {
  "use server"
  const xTable = getXTable(a, b, first)
  const records = await sql<DataRecordWithId[]>`
    SELECT ${sql(b)}.*
    FROM ${sql(b)}
    JOIN ${sql(xTable.name)} ON ${sql(xTable.bColName)} = id
    WHERE ${sql(xTable.aColName)} = ${id}
    ORDER BY id
  `.catch(onError)
  if (records) {
    await injectTranslations(b, records)
    await injectVirtualValues(b, records)
    return records
  }
}