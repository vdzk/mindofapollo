"use server"

import chalk from "chalk";
import postgres from "postgres"
import { schema } from "~/schema/schema";
import { ForeignKey } from "~/schema/type";
import { dbColumnName } from "~/util";

// TODO: move config into .env file
export const sql = postgres({
  host: "localhost",
  port: 5432,
  database: "apollo",
  username: "postgres",
  password: 'jZrZg7aLWkQu',
  debug: true
});

export const onError = (error: Error & {query?: any, parameters?: any}) => {
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
) => sql`
  INSERT INTO ${sql(tableName)} ${sql(record)}
`.catch(onError)

export const updateRecord = (
  tableName: string,
  id: string,
  record: Record<string, string | boolean>
) => sql`
  UPDATE ${sql(tableName)}
  SET ${sql(record, Object.keys(record))}
  WHERE id = ${id}
`.catch(onError)

export const listRecords = (tableName: string) => sql`
  SELECT *
  FROM ${sql(tableName)}
  ORDER BY id
`.catch(onError)

export const listOverlapRecords = (
  tableName: string,
  sharedColumn: string,
  filterTable: string,
  filterId: string
) => sql`
  SELECT ${sql(tableName)}.*
  FROM ${sql(tableName)}
  JOIN ${sql(filterTable)}
    ON ${sql(tableName)}.${sql(sharedColumn)} = ${sql(filterTable)}.${sql(sharedColumn)}
  WHERE ${sql(filterTable)}.id = ${filterId}
  ORDER BY ${sql(tableName)}.id
`.catch(onError)

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

export const listForeignExtRecords = (
  tableName: string,
  fkName: string,
  fkId: string,
  extColName: string
) => {
  const extColumn = schema.tables[tableName].columns[extColName] as ForeignKey
  const extDbColName = dbColumnName(tableName, extColName)

  return sql`
    SELECT tMain.*, tExt.${sql(extColumn.fk.labelColumn)}
    FROM ${sql(tableName)} tMain
    JOIN ${sql(extColumn.fk.table)} tExt
      ON tMain.${sql(extDbColName)} = tExt.id
    WHERE tMain.${sql(fkName)} = ${fkId}
    ORDER BY id
  `.catch(onError)
}

export const getRecordById = async (tableName: string, id: string | number) => {
  if (id === undefined) {
    console.error(chalk.red('ERROR'), 'getRecordById() was called with', {tableName, id})
    return undefined
  } else {
    return  sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE id = ${id}
    `.then(rows => rows[0]).catch(onError)
  }
}

export const deleteById = async (tableName: string, id: string) => sql`
  DELETE FROM ${sql(tableName)}
  WHERE id = ${id}
`.catch(onError)

export const multiListRecords = (tableNames: string[]) => Promise.all(tableNames.map(listRecords)).catch(onError)



