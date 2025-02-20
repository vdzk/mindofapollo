import { sql } from "~/server-only/db"
import { schema } from "~/schema/schema"

export const listOverlapRecords = (
    tableName: string,
    sharedColumn: string,
    filterTable: string,
    filterId: number
) => {
    "use server"
    return sql`
      SELECT ${sql(tableName)}.*
      FROM ${sql(tableName)}
      JOIN ${sql(filterTable)}
        ON ${sql(tableName)}.${sql(sharedColumn)} = ${sql(filterTable)}.${sql(sharedColumn)}
      WHERE ${sql(filterTable)}.id = ${filterId}
      ORDER BY ${sql(tableName)}.id
    `;
}