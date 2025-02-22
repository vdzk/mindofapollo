import { sql } from "~/server-only/db"

export const getOneIdByName = async (tableName: string, name: string) => {
  "use server"

  const results = await sql`
    SELECT id
    FROM ${sql(tableName)}
    WHERE name = ${name}
  `
  return results?.[0]?.id as number
};