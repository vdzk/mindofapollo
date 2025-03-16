import { pick } from "./shape";

export const getExplIdColNames = <K extends string>(colNames: K[]) => colNames
  .map(colName => colName + '_expl_id' as `${K}_expl_id`)

export const addExplIdColNames = <K extends string>(colNames: K[]) => [
  ...colNames,
  ...getExplIdColNames(colNames)
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
};

