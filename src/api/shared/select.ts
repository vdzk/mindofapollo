"use server"

import {schema} from "~/schema/schema"
import {DataLiteral, DataRecordWithId, VirtualColumnLocal, VirtualColumnQueries} from "~/schema/type"
import {onError, sql} from "../../db"
import chalk from "chalk"
import {getVirtualColNames, resolveEntries, xName} from "~/util"
import {Row, RowList} from "postgres"
import {getVirtualValuesByServerFn} from "./virtualColumns"
import {getUserId} from "./session"
import { getPermission } from "~/getPermission"
import { Id } from "~/types"

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
  const userId = await getUserId()
  const { personal } = schema.tables[tableName]
  if (personal && !userId) {
    return []
  }

  const records = await sql`
    SELECT t.*
    FROM ${sql(tableName)} t
    ORDER BY t.id
  `.catch(onError)
  await injectVirtualValues(tableName, records)
  return records
}

export const getRecordById = async (tableName: string, id: string | number) => {
  const userId = await getUserId()
  const permission = getPermission(userId, 'read', tableName, id)
  if (!permission.granted) return
  let colNames = permission.colNames ?? getVirtualColNames(tableName).non
  const records = await sql`
    SELECT ${sql(colNames)}
    FROM ${sql(tableName)}
    WHERE id = ${id}
  `.catch(onError)
  if (records) {
    await injectVirtualValues(tableName, records)
    return records[0] as DataRecordWithId
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
export const listCrossRecords = async (
    b: string,
    a: string,
    id: Id,
    first: boolean
) => {
  const records = await sql`
    SELECT ${sql(b)}.*
    FROM ${sql(b)}
    JOIN ${sql(xName(a, b, first))} ON ${sql(b + '_id')} = id
    WHERE ${sql(a + '_id')} = ${id}
    ORDER BY id
  `.catch(onError)
  if (records) {
    await injectVirtualValues(b, records)
    return records
  }
}
