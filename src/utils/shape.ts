import { DataRecord } from "~/schema/type"

export const indexBy = (
  records: DataRecord[],
  colName: string
): Record<string | number, DataRecord> => Object.fromEntries(
  records.map(record => [record[colName], record])
)

export const getAllKeys = (objects: (Record<string, any> | undefined)[]) => objects.map(obj => obj ? Object.keys(obj) : []).flat()

export const isEmpty = (obj: Record<string, any>) => Object.keys(obj).length === 0

export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => keys.reduce((acc, key) => {
  if (key in obj) acc[key] = obj[key]
  return acc
}, {} as Pick<T, K>)

export const getByPath = <T = unknown>(
  obj: unknown,
  path: readonly string[]
): T | undefined => {
  let current: unknown = obj

  for (const key of path) {
    if (
      typeof current !== 'object' ||
      current === null ||
      !(key in current)
    ) {
      return undefined
    }

    current = (current as Record<string, unknown>)[key]
  }

  return current as T
}