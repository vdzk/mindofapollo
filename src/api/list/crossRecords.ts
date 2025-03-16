import { DataRecordWithId } from "~/schema/type";
import { onError, sql } from "~/server-only/db";
import { injectVirtualValues } from "~/server-only/select";
import { injectTranslations } from "~/server-only/translation";
import { xName } from "~/utils/schema";

export const listCrossRecords = async (
  b: string,
  a: string,
  id: number,
  first: boolean
) => {
  "use server"
  const records = await sql<DataRecordWithId[]>`
    SELECT ${sql(b)}.*
    FROM ${sql(b)}
    JOIN ${sql(xName(a, b, first))} ON ${sql(b + '_id')} = id
    WHERE ${sql(a + '_id')} = ${id}
    ORDER BY id
  `.catch(onError)
  if (records) {
    await injectTranslations(b, records)
    await injectVirtualValues(b, records)
    return records
  }
};