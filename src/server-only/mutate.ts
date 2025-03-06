import { onError, sql } from "./db"
import { DataLiteral, DataRecord, DataRecordWithId } from "~/schema/type"
import { schema } from "~/schema/schema"
import { getValueTypeTableNameByColType } from "~/schema/dataTypes"
import { getTypeByOriginId, getTypeByRecordId } from "./valueType"
import { AddExplId } from "~/components/expl/types"
import { addExplIdColNames, addExplIds } from "~/util"


// TODO: implement efficient bulk version
export const insertValueType = async (
  tableName: string,
  value: DataLiteral,
) => {
  const result = await sql`
    INSERT INTO ${sql(tableName)} (value)
    VALUES (${value})
    RETURNING *
  `.catch(onError)
  return result
}

export const injectValueTypes = async (
  tableName: string,
  record: DataRecord,
  recordId?: number
) => {
  const { columns } = schema.tables[tableName]
  for (const colName in columns) {
    const column = columns[colName]
    if (column.type === 'value_type_id') {
      const value = record[colName]
      if (value !== undefined) {
        const originId = record[column.typeOriginColumn] as number | undefined
        const colType = recordId && !originId
          ? await getTypeByRecordId(tableName, colName, recordId)
          : await getTypeByOriginId(tableName, colName, originId as number)
        const vttn = getValueTypeTableNameByColType(colType)
        const [{ id }] = await insertValueType(vttn, value)
        record[colName] = id
      }
    }
  }
}

export const _insertRecord = async (
  tableName: string,
  record: DataRecord,
  explId: number
) => {
  await injectValueTypes(tableName, record)
  const allColNames = ['id', ...Object.entries(schema.tables[tableName].columns)
    .filter(([colName, column]) =>
      colName !== 'id' && column.type !== 'virtual')
    .map(([colName]) => colName)
  ]
  const explIds = Object.fromEntries(
    allColNames.map(colName => [`${colName}_expl_id`, explId])
  )

  const result = await sql`
    INSERT INTO ${sql(tableName)} ${sql({ ...record, ...explIds })}
    RETURNING *
  `.catch(onError)
  return result[0] as DataRecordWithId
};

// TODO: implement efficient bulk version
export const _insertRecordsOneByOne = async (tableName: string, records: DataRecord[], explId: number) => {
  const inserted = await Promise.all(records.map(record => _insertRecord(tableName, record, explId)))
  return inserted
}

export const _updateRecord = async <T extends DataRecord>(
  tableName: string,
  id: number,
  explId: number,
  newFragment: T
) => {
  const colNames = Object.keys(newFragment)
  if (colNames.length === 0) return { before: {}, after: {} }
  const colNamesWithExplId = addExplIdColNames(colNames)

  const oldFragments = await sql`
    SELECT ${sql(colNamesWithExplId)}
    FROM ${sql(tableName)}
    WHERE id = ${id}
  `.catch(onError)

  await sql`
    UPDATE ${sql(tableName)}
    SET ${sql(
    addExplIds(newFragment, explId),
    colNamesWithExplId
  )}
    WHERE id = ${id}
  `.catch(onError)
  const diff = {
    before: oldFragments[0] as AddExplId<T>,
    after: newFragment
  }
  return diff
}

export const _deleteById = async (
  tableName: string,
  id: number
) => {
  const result = await sql`
    DELETE FROM ${sql(tableName)}
    WHERE id = ${id}
    RETURNING *
  `.catch(onError)
  return result
}