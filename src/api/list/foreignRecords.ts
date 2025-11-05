import { onError, sql } from "~/server-only/db"
import { schema } from "~/schema/schema"
import { injectVirtualValues } from "~/server-only/select"
import { DataRecordWithId } from "~/schema/type";
import { injectTranslations } from "~/server-only/injectTranslations";
import { injectPermissions } from "~/server-only/permissions";

export const listForeignRecords = async (
  tableName: string,
  fkName: string,
  fkId: number | null,
  withPermissions?: boolean
) => {
  "use server"
  const { extendedByTable } = schema.tables[tableName]
  let records
  if (extendedByTable) {
    records = await sql<DataRecordWithId[]>`
      SELECT *, t.id
      FROM ${sql(tableName)} t
      LEFT JOIN ${sql(extendedByTable)} e ON e.id = t.id
      WHERE ${fkId === null
        ? sql`t.${sql(fkName)} IS NULL`
        : sql`t.${sql(fkName)} = ${fkId}`
      }
      ORDER BY t.id
    `.catch(onError)
    await injectTranslations(extendedByTable, records)
    await injectVirtualValues(extendedByTable, records)
  } else {
    records = await sql<DataRecordWithId[]>`
      SELECT *
      FROM ${sql(tableName)}
      WHERE ${fkId === null
        ? sql`${sql(fkName)} IS NULL`
        : sql`${sql(fkName)} = ${fkId}`
      }
      ORDER BY id
    `.catch(onError)
  }
  await injectTranslations(tableName, records)
  await injectVirtualValues(tableName, records)
  if (withPermissions) await injectPermissions(tableName, records)
  return records as unknown as DataRecordWithId[]
};