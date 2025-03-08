import { url } from "./constant"
import { schema } from "./schema/schema"
import { DataRecord } from "./schema/type"

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

export const xName = (a: string, b: string, first?: boolean) => (first ? [a, b] : [b, a]).join('_x_');

export const getAllKeys = (objects: (Record<string, any> | undefined)[]) =>
  objects.map(obj => obj ? Object.keys(obj) : []).flat()

export const isEmpty = (obj: Record<string, any>) => Object.keys(obj).length === 0

export const getPercent = (x: number) => Math.round(x * 100) + '%'

export const buildUrl = (route: string, params?: Record<string, any>) => {
  let url = '/' + route
  if (params) {
    url += '?' + Object.entries(params)
      .map(([k, v]) => k + '=' + v)
      .join('&')
  }
  return url
}

export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> =>
  keys.reduce((acc, key) => {
    if (key in obj) acc[key] = obj[key]
    return acc
  }, {} as Pick<T, K>)


export const addExplIdColNames = <K extends string>(colNames: K[]) => [
  ...colNames,
  ...colNames.map(colName => colName + '_expl_id' as `${K}_expl_id` )
]

export const pickWithExplId = <T extends Record<string, any>, K extends keyof T & string>(
  obj: T,
  keys: K[]
): Pick<T, K> & Record<`${K}_expl_id`, number> => pick(obj, addExplIdColNames(keys))

// add _expl_id properties to the object
export const addExplIds = (record: Record<string, any>, explId: number) => {
  const result = { ...record }
  for (const key in record) {
    result[`${key}_expl_id`] = explId
  }
  return result
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))