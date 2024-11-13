"use server"

import { schema } from "~/schema/schema";
import { DataRecordWithId, ForeignKey } from "~/schema/type";
import { sql, onError } from "./db";
import chalk from "chalk";


export const listRecords = (tableName: string) => sql`
  SELECT *
  FROM ${sql(tableName)}
  ORDER BY id
`.catch(onError);

export const getRecordById = async (tableName: string, id: string | number) => {
  if (id === undefined) {
    console.error(chalk.red('ERROR'), 'getRecordById() was called with', {tableName, id})
    return undefined
  } else {
    return  sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE id = ${id}
    `.then(rows => rows[0] as DataRecordWithId).catch(onError)
  }
}

export const listOverlapRecords = (
  tableName: string,
  sharedColumn: string,
  filterTable: string,
  filterId: number
) => sql`
  SELECT ${sql(tableName)}.*
  FROM ${sql(tableName)}
  JOIN ${sql(filterTable)}
    ON ${sql(tableName)}.${sql(sharedColumn)} = ${sql(filterTable)}.${sql(sharedColumn)}
  WHERE ${sql(filterTable)}.id = ${filterId}
  ORDER BY ${sql(tableName)}.id
`.catch(onError);

export const listForeignRecords = (
  tableName: string,
  fkName: string,
  fkId: number
) => sql`
  SELECT *
  FROM ${sql(tableName)}
  WHERE ${sql(fkName)} = ${fkId}
  ORDER BY id
`.catch(onError);

export const listForeignHopRecords = (
  tableName: string,
  fkName: string,
  fkId: number,
  hopColName: string
) => {
  const extColumn = schema.tables[tableName].columns[hopColName] as ForeignKey;

  // tMain.id overrides tHop.id
  return sql`
    SELECT tHop.*, tMain.*
    FROM ${sql(tableName)} tMain
    JOIN ${sql(extColumn.fk.table)} tHop
      ON tMain.${sql(hopColName)} = tHop.id
    WHERE tMain.${sql(fkName)} = ${fkId}
    ORDER BY tMain.id
  `.catch(onError);
};

