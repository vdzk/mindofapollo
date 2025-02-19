"use server"

import { sql } from "../../server-only/db"
import { DataLiteral, DataRecord } from "~/schema/type"
import { getUserSession } from "./session"
import { listRecords } from "./select"
import { schema } from "~/schema/schema"
import { getValueTypeTableNameByColType } from "~/schema/dataTypes"
import { getTypeByOriginId, getTypeByRecordId } from "./valueType"
import { getPermission } from "~/getPermission"
import chalk from "chalk"
import { AddExplId } from "~/components/expl/types"
import { finishExpl, setExplRecordId, startExpl } from "~/server-only/expl"
import { addExplIdColNames, addExplIds } from "~/util"
import { UserSession } from "~/types"

type Tail<T extends any[]> = T extends [any, ...infer U] ? U : never;

// TODO: implement efficient bulk version
export const insertValueType = async (
  tableName: string,
  value: DataLiteral,
) => {
  const result = await sql`
    INSERT INTO ${sql(tableName)} (value)
    VALUES (${value})
    RETURNING *
  `
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
  `;
  return result[0];
};

export const _insertRecordsOneByOne = async (tableName: string, records: DataRecord[], explId: number) => {
  await Promise.all(records.map(record => _insertRecord(tableName, record, explId)))
}

export const insertRecord = async (
  tableName: string,
  record: DataRecord
) => {
  const userSession = await getUserSession()
  if (!getPermission(userSession, 'create', tableName).granted) return
  await injectValueTypes(tableName, record)
  const explId = await startExpl(userSession.userId, 'genericChange', 1, tableName, null);
  const result = await _insertRecord(tableName, record, explId);
  await setExplRecordId(explId, result.id)
  return [result];
};

// TODO: implement efficient bulk version
export const insertRecordsOneByOne = async (
  tableName: string,
  records: DataRecord[]
) => await Promise.all(
  records.map((record) => insertRecord(tableName, record))
)

export const updateRecord = async (
  tableName: string,
  id: number,
  record: DataRecord
) => {
  const userSession = await getUserSession()
  const permission = getPermission(userSession, 'update', tableName, id)
  if (!permission.granted) return
  if (permission.colNames) {
    const forbiddenColumn = Object.keys(record)
      .find(colName => !permission.colNames!.includes(colName))
    if (forbiddenColumn) {
      // TODO: return and process error on the client
      console.trace()
      console.log(chalk.red('ERROR'), { forbiddenColumn })
      return
    }
  }
  await injectValueTypes(tableName, record, id)
  const explId = await startExpl(userSession.userId, 'genericChange', 1, tableName, id);
  const diff = await _updateRecord(tableName, id, explId, record)
  await finishExpl(explId, {diff})
}

export const _updateRecord = async <T extends DataRecord>(
  tableName: string,
  id: number,
  explId: number,
  newFragment: T
) => {
  const colNames = Object.keys(newFragment)
  const colNamesWithExplId = addExplIdColNames(colNames)

  const oldFragments = await sql`
    SELECT ${sql(colNamesWithExplId)}
    FROM ${sql(tableName)}
    WHERE id = ${id}
  `

  await sql`
    UPDATE ${sql(tableName)}
    SET ${sql(
    addExplIds(newFragment, explId),
    colNamesWithExplId
  )}
    WHERE id = ${id}
  `
  const diff = {
    before: oldFragments[0] as AddExplId<T>,
    after: newFragment
  }
  return diff
}

export const deleteById = async (
  tableName: string,
  id: number
) => {
  const userSession = await getUserSession()
  if (!getPermission(userSession, 'delete', tableName, id).granted) return
  const result = await sql`
    DELETE FROM ${sql(tableName)}
    WHERE id = ${id}
    RETURNING *
  `;
  return result;
};

export const multiListRecords = (tableNames: string[]) => Promise.all(tableNames.map(listRecords));

