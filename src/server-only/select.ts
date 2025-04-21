import { onError, sql } from "./db"
import { DataLiteral, DataRecordWithId, VirtualColumnLocal, VirtualColumnQueries, VqSettings } from "~/schema/type"
import { getExplIdColNames } from "~/utils/expl"
import { resolveEntries } from "~/utils/async"
import { getTranslatableColumns, getVirtualColNames, needsExpl } from "~/utils/schema"
import { Row, RowList } from "postgres"
import { getVirtualValuesByServerFn } from "./virtualColumns"
import { schema } from "~/schema/schema"
import { injectTranslations } from "./injectTranslations"
import { queryVirtualColumn, VqColumn } from "./queryVirtualColumn"

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
        ([queryName, query]) => {
          let startTable: string
          let columns: VqColumn[]
          let whereColumn: string
          if (Array.isArray(query[0])) {
            startTable = tableName
            whereColumn = 'id'
            columns = query as VqColumn[]
          } else {
            const vqSettings = query[0] as VqSettings
            startTable = vqSettings.startTable
            whereColumn = vqSettings.fkName
            columns = query.slice(1) as VqColumn[]
          }
          return [queryName, queryVirtualColumn(startTable, columns, ids, whereColumn)]
        }
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
  records: DataRecordWithId[],
  mainIdColName: string
) => Object.fromEntries(colNames.map(colName => [
  colName,
  Object.fromEntries(records.map(record => [
    record[mainIdColName] as number,
    (schema.tables[tableName].columns[colName] as VirtualColumnLocal)
      .getLocal({...record, id: record[mainIdColName] as number})
  ])) as Record<number, string>
]))

export const injectVirtualValues = async (
  tableName: string,
  records?: DataRecordWithId[] | RowList<Row[]>,
  colNames?: string[],
  mainIdColName = 'id'
) => {
  const virtualColNames = getVirtualColNames(tableName, colNames)

  if (virtualColNames.all.length > 0 && records && records.length > 0) {
    const ids = records.map(record => record[mainIdColName] as number)
    const virtualValues = (await Promise.all([
      getVirtualValuesByQueries(tableName, virtualColNames.queries, ids),
      getVirtualValuesByServerFn(tableName, virtualColNames.serverFn, ids),
      getVirtualValuesByLocal(tableName, virtualColNames.local, records as DataRecordWithId[], mainIdColName)
    ])).reduce((acc, cur) => ({ ...acc, ...cur }), {})
    for (const record of records) {
      for (const colName of virtualColNames.all) {
        record[colName] = virtualValues[colName][record[mainIdColName] as number]
      }
    }
  }
}

export const getSelectColNames = (
  tableName: string,
  colNames?: string[],
  withExplIds = true
) => {
  const selectColNames = [
    ...getTranslatableColumns(tableName, colNames, false),
    ...(withExplIds
      ? getExplIdColNames(getVirtualColNames(tableName, colNames).non)
      : []
    )
  ]
  if (!selectColNames.includes('id')) selectColNames.push('id')
  return selectColNames
}

export const _getRecordsByIds = async (
  tableName: string,
  idColName: string,
  ids: number[],
  colNames?: string[],
  withExplIds = true,
) => {
  if (ids.length === 0) return [] as DataRecordWithId[]
  const records = await sql<DataRecordWithId[]>`
    SELECT ${sql(getSelectColNames(
      tableName, colNames, withExplIds && needsExpl(tableName)
    ))}
    FROM ${sql(tableName)}
    WHERE ${sql(idColName)} IN ${sql(ids)}
  `.catch(onError)
  
  await injectTranslations(tableName, records, colNames)
  await injectVirtualValues(tableName, records, colNames)
  return records
}

export const _getRecordById = async (
  tableName: string,
  id: number,
  colNames?: string[],
  withExplIds = true
) => {
  const records = await _getRecordsByIds(tableName, 'id', [id], colNames, withExplIds)
  return records[0]
}

export const getValueById = async (tableName: string, id: number) => {
  const results = await sql`
    SELECT value
    FROM ${sql(tableName)}
    WHERE id = ${id}
  `.catch(onError)
  return results?.[0]?.value as DataLiteral
}

