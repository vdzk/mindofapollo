import { schema } from "~/schema/schema"
import { ColumnSchema, DataRecord, ForeignKey } from "~/schema/type"
import { humanCase } from "./string"
import memoizeOne from "memoize-one"
import { LinkData } from "~/types"

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

export const getExtTableSelectorColName = (tableName: string) => {
  const tableSchema = schema.tables[tableName]
  for (const colName in tableSchema.columns) {
    const column = tableSchema.columns[colName]
    if (column.type === 'fk' && column.fk.extensionTables) {
      return colName
    }
  }
}

export const getExtTableName = (
  tableName: string,
  record?: DataRecord,
  optionalExtEnabled?: boolean,
  extensionTableIndex?: number
) => {
  const tableSchema = schema.tables[tableName]
  if (optionalExtEnabled) return tableSchema.optionallyExtendedByTable
  if (!record) return
  const colName = getExtTableSelectorColName(tableName)
  if (!colName) return
  const column = tableSchema.columns[colName] as ForeignKey
  const extTableIndex = extensionTableIndex ?? record[colName] as number
  return column.fk.extensionTables![extTableIndex]
}

export const getRootTableName = (tableName: string): string => {
  const { extendsTable } = schema.tables[tableName]
  return extendsTable ? getRootTableName(extendsTable) : tableName
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

// Determines if a column's content should be picked from the translation table
export const translatable = (tableName: string, columnName: string): boolean => {
  if (columnName === 'id') return false
  const table = schema.tables[tableName]
  const column = table.columns[columnName]
  
  // Check if table is private or translation is explicitly disabled
  if (table.private || table.translate === false) {
    return false
  }

  // Check if column type is one of the translatable types
  const translatableTypes: ColumnSchema['type'][] = ['varchar', 'text', 'link_title']
  return translatableTypes.includes(column.type)
}

export const splitTranslatable = (tableName: string, record: DataRecord) => {
  let translationRequired = false
  const originalText: Record<string, string> = {}
  const nonTranslatable:DataRecord = {}
  for (const colName in record) {
    if (translatable(tableName, colName)) {
      translationRequired = true
      originalText[colName] = record[colName] as string
    } else {
      nonTranslatable[colName] = record[colName]
    }
  }
  return { translationRequired, originalText, nonTranslatable }
}

export const getTranslatableColumns = (
  tableName: string,
  colNames?: string[] | null,
  isTranslatable?: boolean
): string[] => {
  return getVirtualColNames(tableName, colNames ?? undefined).non.
    filter(colName => {
      const colIsTranslatable = translatable(tableName, colName)
      return (isTranslatable ?? true) ? colIsTranslatable : !colIsTranslatable
    })
}

export const needsExpl = (tableName: string) => schema.tables[tableName].expl ?? true

export const getChildFkRelations = memoizeOne(() => {
  const relations: Record<string, [string, string][]> = {}
  for (const tableName in schema.tables) {
    relations[tableName] = []
  }
  for (const childTable in schema.tables) {
    const tableSchema = schema.tables[childTable]
    if (tableSchema.extendsTable) {
      relations[tableSchema.extendsTable].push([childTable, 'id'])
    }
    for (const [colName, column] of Object.entries(tableSchema.columns)) {
      if (column.type === 'fk') {
        relations[column.fk.table].push([childTable, colName])
      }
    }
  }
  return relations
})
export const buildUrl = (linkData: LinkData) => {
  let { route, params } = linkData;
  // Rewrite link
  if (route === 'show-record' && params) {
    params.tableName = getRootTableName(params.tableName)
    if (['statement', 'argument'].includes(params.tableName)) {
      route = params.tableName
      params = { id: params.id }
    }
  }

  let url = '/' + route;
  if (params) {
    url += '?' + Object.entries(params)
      .map(([k, v]) => k + '=' + v)
      .join('&');
  }
  return url;
};
