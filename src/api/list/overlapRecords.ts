import { onError, sql } from "~/server-only/db"
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
    WHERE 
      -- Match standard case where values are equal
      t.${sql(sharedColumn)} IN (
        SELECT ft.${sql(sharedColumn)}
        FROM ${sql(filterTable)} ft
        WHERE ft.id = ${filterId}
      )
      -- Or include cases where t's shared column is NULL (matches all)
      OR t.${sql(sharedColumn)} IS NULL
    ORDER BY t.id
  `.catch(onError)
  return results as unknown as DataRecordWithId[]
}