import { sql } from "~/server-only/db"
import { DataRecordWithId } from "~/schema/type"

export const listOverlapRecords = async (
  tableName: string,
  sharedColumn: string,
  filterTable: string,
  filterId: number
) => {
  "use server"
  const results = await sql`
    SELECT t.*
    FROM ${sql(tableName)} t
    JOIN ${sql(filterTable)} ft
      ON t.${sql(sharedColumn)} = ft.${sql(sharedColumn)}
    WHERE ft.id = ${filterId}
    ORDER BY t.id
  `
  return results as unknown as DataRecordWithId[]
}