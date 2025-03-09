import { schema } from "~/schema/schema"
import { DataRecord } from "~/schema/type"
import { humanCase } from "./string"


export const titleColumnName = (tableName: string) => {
  let result = ''
  const { columns } = schema.tables[tableName]
  for (const colName in columns) {
    if (!result) {
      result = colName
    }
    if ('preview' in columns[colName]) {
      result = colName
      break
    }
  }
  return result
}

export const getExtTableName = (
  tableName: string,
  record?: DataRecord,
  extValue?: string
) => {
  if (record && !extValue) {
    const tableSchema = schema.tables[tableName]
    for (const [colName, column] of Object.entries(tableSchema.columns)) {
      if (column.type === 'fk') {
        const { extensionTables } = column.fk
        if (extensionTables) {
          if (record[colName]) {
            extValue = extensionTables[record[colName] as number]
            break
          }
        }
      }
    }
  }
  if (extValue) {
    return [tableName, extValue].join('_')
  }
}

export const pluralTableName = (tableName: string) => {
  return schema.tables[tableName].plural ?? humanCase(tableName) + ' items'
}

export const hasOwnFields = (tableName: string) => Object.values(
  schema.tables[tableName].columns
).some(column => !['fk', 'virtual'].includes(column.type))

export const getVirtualColNames = (tableName: string, colNames?: string[]) => {
  const all = []
  const queries = []
  const serverFn = []
  const local = []
  const non = ['id']
  const { columns } = schema.tables[tableName]
  for (const colName in columns) {
    if (colNames && !colNames.includes(colName)) continue
    const column = columns[colName]
    if (column.type === 'virtual') {
      all.push(colName)
      if (('serverFn' in column) && column.serverFn) {
        serverFn.push(colName)
      } else if ('getLocal' in column) {
        local.push(colName)
      } else {
        queries.push(colName)
      }
    } else {
      non.push(colName)
    }
  }
  return { all, non, queries, serverFn, local }
}

export const xName = (a: string, b: string, first?: boolean) => (first ? [a, b] : [b, a]).join('_x_')

