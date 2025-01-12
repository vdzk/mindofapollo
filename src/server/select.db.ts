"use server"

import { schema } from "~/schema/schema";
import { DataLiteral, DataRecordWithId, ForeignKey, VirtualColumnLocal, VirtualColumnQueries } from "~/schema/type";
import { sql, onError } from "./db";
import chalk from "chalk";
import { getVirtualColNames, resolveEntries } from "~/util";
import { Row, RowList } from "postgres";
import { getVirtualValuesByServerFn } from "./virtualColumns";
import { safeWrap } from "./mutate.db";
import { getUserId } from "./session";

export const getVirtualValuesByQueries = async (
  tableName: string,
  colNames: string[],
  ids: number[]
) => {
  const getCol = (colName: string) => (schema.tables[tableName].columns
  [colName] as VirtualColumnQueries)
  // Use nested Promise.all() to run all queries in paralel 
  const virtualResults = await resolveEntries(colNames.map(
    colName => [colName, resolveEntries(
      Object.entries(getCol(colName).queries).map(
        ([queryName, query]) => [queryName, sql.unsafe(query, [ids])]
      )
    )]
  ))
  const virtualValues = Object.fromEntries(
    Object.entries(virtualResults).map(
      ([colName, records]) => [colName, getCol(colName).get(ids, records)]
    )
  )
  return virtualValues
}

export const getVirtualValuesByLocal = (
  tableName: string,
  colNames: string[],
  records: DataRecordWithId[]
) => Object.fromEntries(colNames.map(colName => [
  colName,
  Object.fromEntries(records.map(record => [
    record.id,
    (schema.tables[tableName].columns[colName] as VirtualColumnLocal)
      .getLocal(record)
  ])) as Record<number, string>
]))

export const injectVirtualValues = async (
  tableName: string,
  records?: DataRecordWithId[] | RowList<Row[]>
) => {
  const virtualColNames = getVirtualColNames(tableName)

  if (virtualColNames.all.length > 0 && records && records.length > 0) {
    const ids = records.map(record => record.id as number)
    const virtualValues = (await Promise.all([
      getVirtualValuesByQueries(tableName, virtualColNames.queries, ids),
      getVirtualValuesByServerFn(tableName, virtualColNames.serverFn, ids),
      getVirtualValuesByLocal(tableName, virtualColNames.local, records as DataRecordWithId[])
    ])).reduce((acc, cur) => ({ ...acc, ...cur }), {})
    for (const record of records) {
      for (const colName of virtualColNames.all) {
        record[colName] = virtualValues[colName][record.id]
      }
    }
  }
}

export const listRecords = async ( tableName: string ) => {
  const userId = await getUserId();
  const { personal } = schema.tables[tableName]
  if (personal && !userId) {
    return []
  }
  const createdBy = (tableName: string, userId: number) => sql`
  JOIN ${sql(tableName + '_h')} h
    ON h.id = t.id
    AND h.op_user_id = ${userId}
    AND h.data_op = 'INSERT'
`

  const records = await sql`
    SELECT t.*
    FROM ${sql(tableName)} t
    ${ personal ? createdBy(tableName, userId!) : sql``}
    ORDER BY t.id
  `.catch(onError)
  await injectVirtualValues(tableName, records)
  return records
};

export const getRecordById = async (tableName: string, id: string | number) => {
  if (id === undefined) {
    console.error(chalk.red('ERROR'), 'getRecordById() was called with', { tableName, id })
    return undefined
  } else {
    const records = await sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE id = ${id}
    `.catch(onError)
    if (records) {
      await injectVirtualValues(tableName, records)
      return records[0] as DataRecordWithId
    }
  }
}

export const getValueById = async (tableName: string, id: number) => {
  const results = await sql`
    SELECT value
    FROM ${sql(tableName)}
    WHERE id = ${id}
  `.catch(onError)
  return results?.[0]?.value as DataLiteral
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

export const listForeignRecords = async (
  tableName: string,
  fkName: string,
  fkId: number
) => {
  const { extendedByTable } = schema.tables[tableName]
  let records
  if (extendedByTable) {
    records = await sql`
      SELECT *, t.id
      FROM ${sql(tableName)} t
      LEFT JOIN ${sql(extendedByTable)} e ON e.id = t.id
      WHERE t.${sql(fkName)} = ${fkId}
      ORDER BY t.id
    `.catch(onError)
  } else {
    records = await sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE ${sql(fkName)} = ${fkId}
      ORDER BY id
    `.catch(onError)
  }
  await injectVirtualValues(tableName, records)
  return records
};

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

