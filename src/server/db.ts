"use server"

import chalk from "chalk";
import postgres from "postgres"

export const sql = postgres({
  host: "localhost",
  port: 5432,
  database: "apollo",
  username: "postgres",
  password: 'jZrZg7aLWkQu'
});

const onError = (error: Error & {query?: any, parameters?: any}) => {
  if (error.name === 'PostgresError') {
    console.log()
    console.log(error.query.trim().replaceAll(/\n\s+/g, '\n'))
    if (error.parameters && error.parameters.length > 0) {
      console.log(error.parameters)
    }
    console.log(chalk.red('ERROR'), error.message)
  } else {
    console.error(error)
  }
  return undefined
} 

export const insertRecord = (
  tableName: string,
  record: Record<string, string | boolean>
) => sql`INSERT INTO ${sql(tableName)} ${sql(record)}`.catch(onError)

export const updateRecord = (
  tableName: string,
  id: string,
  record: Record<string, string | boolean>
) => sql`
  UPDATE ${sql(tableName)}
  SET ${sql(record, Object.keys(record))}
  WHERE id = ${id}
`.catch(onError)

export const listRecords = (tableName: string) => sql`SELECT * FROM ${sql(tableName)} ORDER BY id`.catch(onError)

export const listForeignRecords = (
  tableName: string,
  fkName: string,
  fkId: string
) => sql`
  SELECT *
  FROM ${sql(tableName)}
  WHERE ${sql(fkName)} = ${fkId}
  ORDER BY id
`.catch(onError)

export const getRecordById = async (tableName: string, id: string | number) => sql`SELECT * FROM ${sql(tableName)} WHERE id = ${id}`.then(rows => rows[0]).catch(onError)

export const deleteById = async (tableName: string, id: string) => sql`DELETE FROM ${sql(tableName)} WHERE id = ${id}`.catch(onError)

export const multiListRecords = (tableNames: string[]) => Promise.all(tableNames.map(listRecords)).catch(onError)
