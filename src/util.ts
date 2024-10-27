import postgres from "postgres"
import { schema } from "./schema/schema"

export const humanCase = (str: string) => str
  .split('_')
  .join(' ')

export const firstCap = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export const nbsp = '\xa0'

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

export const dbColumnName = (tableName: string, colName: string) => {
  const columnSchema = schema.tables[tableName].columns[colName]
  if (columnSchema.type === 'fk' && columnSchema.name) {
    return columnSchema.name
  } else {
    return colName
  }
}

export const titleDbColumnName = (tableName: string) => {
  const titleColName = titleColumnName(tableName)
  const titleColumn = schema.tables[tableName].columns[titleColName]
  if (titleColumn.type === 'fk') {
    return titleColumn.fk.labelColumn
  } else {
    return dbColumnName(tableName, titleColName)
  }
}

export const getExtTableName = (
  tableName: string,
  record: postgres.Row
) => {
  const tableSchema = schema.tables[tableName]
  for (const [colName, column] of Object.entries(tableSchema.columns)) {
    if (column.type === 'fk' && column.fk.extensionTables) {
      if (record[colName]) {
        return tableName + '_' + record[colName]
      }
    }
  }
}

export const pluralTableName = (tableName: string) => {
  return schema.tables[tableName].plural ?? humanCase(tableName) + ' items'
}


export const etv = (fn: (val: string) => void) => (event: {target: { value: string }}) => fn(event.target.value)

export const arrayToObjects = (arrayOfArrays: any[][], keys: string[]) => {
  return arrayOfArrays.map(innerArray => {
    return keys.reduce((obj: Record<string, any>, key, index) => {
      obj[key] = innerArray[index];
      return obj;
    }, {});
  });
}
