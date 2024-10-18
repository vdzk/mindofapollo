"use server"

import postgres from "postgres"

export const sql = postgres({
  host: "localhost",
  port: 5432,
  database: "apollo",
  username: "postgres",
  password: 'jZrZg7aLWkQu'
});

export const insertRecord = (
  tableName: string,
  record: Record<string, string | boolean>
) => sql`INSERT INTO ${sql(tableName)} ${sql(record)}`

export const updateRecord = (
  tableName: string,
  id: string,
  record: Record<string, string | boolean>
) => sql`
  UPDATE ${sql(tableName)}
  SET ${sql(record, Object.keys(record))}
  WHERE id = ${id}
`

export const listRecords = (tableName: string) => sql`SELECT * FROM ${sql(tableName)} ORDER BY id`

export const getRecordById = async (tableName: string, id: string) => {
  const results = await sql`SELECT * FROM ${sql(tableName)} WHERE id = ${id}`
  return results[0]
}

export const deleteById = async (tableName: string, id: string) => sql`DELETE FROM ${sql(tableName)} WHERE id = ${id}`

export const multiListRecords = (tableNames: string[]) => Promise.all(tableNames.map(listRecords))