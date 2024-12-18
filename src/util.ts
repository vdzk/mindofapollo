import { schema } from "./schema/schema"
import { DataRecord } from "./schema/type"
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

TimeAgo.addDefaultLocale(en)
export const timeAgo = new TimeAgo('en-US')

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

export const getExtTableName = (
  tableName: string,
  record?: DataRecord,
  extValue?: string
) => {
  if (record && !extValue) {
    const tableSchema = schema.tables[tableName]
    for (const [colName, column] of Object.entries(tableSchema.columns)) {
      if (column.type === 'fk' && column.fk.extensionTables) {
        if (record[colName]) {
          extValue = '' + record[colName]
          break
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


export const etv = (fn: (val: string) => void) => (event: {target: { value: string }}) => fn(event.target.value)

export const arrayToObjects = (arrayOfArrays: any[][], keys: string[]) => {
  return arrayOfArrays.map(innerArray => {
    return keys.reduce((obj: Record<string, any>, key, index) => {
      obj[key] = innerArray[index];
      return obj;
    }, {});
  });
}
