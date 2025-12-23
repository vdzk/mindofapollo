import { schema } from "~/schema/schema"
import { DataRecordWithId, ForeignKey } from "~/schema/type"
import { sql } from "~/server-only/db"
import { injectTranslations } from "~/server-only/injectTranslations"
import { injectVirtualValues } from "~/server-only/select"

export const listForeignCrossRecords = async (
  crossTableName: string,
  sourceFkName: string,
  targetFkName: string,
  sourceFkId: number
) => {
  "use server"
  const targetTableName = (schema.tables[crossTableName].columns[targetFkName] as ForeignKey).fk!.table
  const records = await sql<DataRecordWithId[]>`
    SELECT c.*, t.*
    FROM ${sql(crossTableName)} c
    JOIN ${sql(targetTableName)} t
      ON t.id = c.${sql(targetFkName)}
    WHERE c.${sql(sourceFkName)} = ${sourceFkId}
    ORDER BY t.id
  `
  await injectTranslations(targetTableName, records)
  await injectVirtualValues(targetTableName, records)
  return records
}