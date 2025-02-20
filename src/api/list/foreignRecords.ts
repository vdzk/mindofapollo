import { sql } from "~/server-only/db"
import { schema } from "~/schema/schema"
import { injectVirtualValues } from "~/server-only/select"

export const listForeignRecords = async (
    tableName: string,
    fkName: string,
    fkId: number
) => {
    "use server"
    const {extendedByTable} = schema.tables[tableName]
    let records
    if (extendedByTable) {
        records = await sql`
      SELECT *, t.id
      FROM ${sql(tableName)} t
      LEFT JOIN ${sql(extendedByTable)} e ON e.id = t.id
      WHERE t.${sql(fkName)} = ${fkId}
      ORDER BY t.id
    `
    } else {
        records = await sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE ${sql(fkName)} = ${fkId}
      ORDER BY id
    `
    }
    await injectVirtualValues(tableName, records)
    return records
};