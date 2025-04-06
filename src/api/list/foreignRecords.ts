import { onError, sql } from "~/server-only/db"
import { schema } from "~/schema/schema"
import { injectVirtualValues } from "~/server-only/select"
import { DataRecordWithId } from "~/schema/type";
import { injectTranslations } from "~/server-only/injectTranslations";

export const listForeignRecords = async (
  tableName: string,
  fkName: string,
  fkId: number
) => {
  "use server"
  const { extendedByTable } = schema.tables[tableName]
  let records
  if (extendedByTable) {
    records = await sql<DataRecordWithId[]>`
      SELECT *, t.id
      FROM ${sql(tableName)} t
      LEFT JOIN ${sql(extendedByTable)} e ON e.id = t.id
      WHERE t.${sql(fkName)} = ${fkId}
      ORDER BY t.id
    `.catch(onError)
    await injectTranslations(extendedByTable, records)
    await injectVirtualValues(extendedByTable, records)
  } else {
    records = await sql<DataRecordWithId[]>`
      SELECT *
      FROM ${sql(tableName)}
      WHERE ${sql(fkName)} = ${fkId}
      ORDER BY id
    `.catch(onError)
  }
  await injectTranslations(tableName, records)
  await injectVirtualValues(tableName, records)
  return records as unknown as DataRecordWithId[]
};