import { DataRecord } from "~/schema/type"

export const indexBy = (records: DataRecord[], colName: string) => Object.fromEntries(records.map(record => [record[colName], record]))

export const getAllKeys = (objects: (Record<string, any> | undefined)[]) => objects.map(obj => obj ? Object.keys(obj) : []).flat()

export const isEmpty = (obj: Record<string, any>) => Object.keys(obj).length === 0

export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => keys.reduce((acc, key) => {
  if (key in obj) acc[key] = obj[key]
  return acc
}, {} as Pick<T, K>)

