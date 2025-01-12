import { useLocation } from "@solidjs/router"
import { publicRoutes, url } from "./constant"
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
  // console.log('titleColumnName', tableName, result)
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


export const etv = (fn: (val: string, name: string) => void) =>
  (event: { target: { value: string, name: string } }) =>
    fn(event.target.value, event.target.name)

export const arrayToObjects = (arrayOfArrays: any[][], keys: string[]) => {
  return arrayOfArrays.map(innerArray => {
    return keys.reduce((obj: Record<string, any>, key, index) => {
      obj[key] = innerArray[index];
      return obj;
    }, {});
  });
}

// Dummy function to enable SQL syntax highlighting
export const sqlStr = (strings: TemplateStringsArray) => strings[0]

export const getVirtualColNames = (tableName: string) => {
  const all = []
  const queries = []
  const serverFn = []
  const local = []
  const { columns } = schema.tables[tableName]
  for (const colName in columns) {
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
    }
  }
  return {all, queries, serverFn, local}
}

export const resolveEntries = async <T>(entries: [string, Promise<T>][]) =>
  Object.fromEntries(
    await Promise.all(
      entries.map(
        async ([key, promise]) => [key, await promise]
      )
    )
  ) as Record<string, T>;

export const indexBy = (records: DataRecord[], colName: string) =>
  Object.fromEntries(records.map(record => [record[colName], record]))

export const getUrl = (path: string) =>
  url.scheme + '://' + url.host + ':' + url.port + path

export const genCode = (length: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  return code;
}

export const useIsPublicRoute = () => {
  const location = useLocation()
  return () => publicRoutes.includes(location.pathname)
}