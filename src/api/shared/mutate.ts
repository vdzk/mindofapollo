"use server"

import { DataLiteral, DataOp, DataRecord } from "~/schema/type";
import { onError, sql } from "../../db";
import { getUserId } from "./session";
import { listRecords } from "./select";
import { schema } from "~/schema/schema";
import { getValueTypeTableNameByColType } from "~/schema/dataTypes";
import { getTypeByOriginId, getTypeByRecordId } from "./valueType";
import { getPermission } from "~/getPermission";
import { Id } from "~/types";
import chalk from "chalk";
import { AddExplId } from "~/components/expl/types";


type Tail<T extends any[]> = T extends [any, ...infer U] ? U : never;

// Handle SQL error and userId checking
export function safeWrap<
  F extends (userId: number, ...args: any[]) => any>(
    fn: F): (
      ...args: Tail<Parameters<F>>
    ) => Promise<Awaited<ReturnType<F>> | undefined> {
  return async function (...args: Tail<Parameters<F>>): Promise<Awaited<ReturnType<F>> | undefined> {
    const userId = await getUserId();
    // const userId = 1
    if (!userId) {
      onError(new Error('Error: no userId'));
    } else {
      try {
        return await fn(userId, ...args);
      } catch (error) {
        onError(error as any);
      }
    }
  };
}

// TODO: implement efficient bulk version
export const insertValueType = async (
  userId: number,
  op_action: string,
  tableName: string,
  value: DataLiteral,
) => {
  const result = await sql`
    INSERT INTO ${sql(tableName)} (value)
    VALUES (${value})
    RETURNING *
  `
  await writeHistory(userId, op_action, 'INSERT', tableName, result[0]);
  return result
}

export const injectValueTypes = async (
  userId: number,
  op_action: string,
  tableName: string,
  record: DataRecord,
  recordId?: Id
) => {
  const { columns } = schema.tables[tableName]
  for (const colName in columns) {
    const column = columns[colName]
    if (column.type === 'value_type_id') {
      // Assume that the value is provided insed of the id
      const value = record[colName]
      if (value !== undefined) {
        const originId = record[column.typeOriginColumn] as number | undefined
        const colType = recordId && !originId
          ? await getTypeByRecordId(tableName, colName, recordId)
          : await getTypeByOriginId(tableName, colName, originId as number)
        const vttn = getValueTypeTableNameByColType(colType)
        const [{id}] = await insertValueType(userId, op_action, vttn, value)
        record[colName] = id
      }
    }
  }
}

export const insertRecord = safeWrap(async (
  userId: number,
  op_action: string,
  tableName: string,
  record: DataRecord
) => {
  if (!getPermission(userId, 'create', tableName).granted) return
  await injectValueTypes(userId, op_action, tableName, record)
  const result = await sql`
    INSERT INTO ${sql(tableName)} ${sql(record)}
    RETURNING *
  `;
  await writeHistory(userId, op_action, 'INSERT', tableName, result[0]);
  return result;
});

// TODO: implement efficient bulk version
export const writeHistory = async (
  userId: number,
  op_action: string,
  data_op: DataOp,
  tableName: string,
  record?: DataRecord
) => {
  if (record) {
    await sql`
      INSERT INTO ${sql(tableName + '_h')} ${sql({
        ...record,
        data_op,
        op_action,
        op_user_id: userId
      })}
    `;
  }
};

// TODO: implement an efficient bulk version
export const insertRecordsOneByOne = async (
  op_action: string,
  tableName: string,
  records: DataRecord[]
) => await Promise.all(
  records.map((record) => insertRecord(op_action, tableName, record))
)

export const updateRecord = safeWrap(async (
  userId: number,
  op_action: string,
  tableName: string,
  id: Id,
  record: DataRecord
) => {
  const permission = getPermission(userId, 'update', tableName, id)
  if (!permission.granted) return
  await injectValueTypes(userId, op_action, tableName, record, id)
  const forbiddenColumn = Object.keys(record)
    .find(colName => !permission.colNames!.includes(colName))
  if (forbiddenColumn) {
    // TODO: return and process error on the client
    console.trace()
    console.log(chalk.red('ERROR'), {forbiddenColumn})
  } else {
    _updateRecord(userId, op_action, tableName, id, record)
  }
})

export const _updateRecord = async <T extends DataRecord>(
  tableName: string,
  id: Id,
  explId: number,
  newFragment: T
) => {
  const colNames = Object.keys(newFragment)
  const explIdColNames = colNames.map(colName => colName + '_expl_id')

  const oldFragments = await sql`
    SELECT ${sql([...colNames, ...explIdColNames])}
    FROM ${sql(tableName)}
    WHERE id = ${id}
  `
  const explIdFragment = Object.fromEntries(
    explIdColNames.map(key => [key, explId]))
  
  await sql`
    UPDATE ${sql(tableName)}
    SET ${sql(
      {...newFragment, ...explIdFragment} as any,
      [...colNames, ...explIdColNames]
    )}
    WHERE id = ${id}
  `
  const diff = {
    before: oldFragments[0] as AddExplId<T>,
    after: newFragment
  }
  return diff
}

export const deleteById = safeWrap(async (
  userId: number,
  op_action: string,
  tableName: string,
  id: Id
) => {
  const result = await sql`
    DELETE FROM ${sql(tableName)}
    WHERE id = ${id}
    RETURNING *
  `;
  await writeHistory(userId, op_action, 'DELETE', tableName, result[0])
});
export const multiListRecords = (tableNames: string[]) => Promise.all(tableNames.map(listRecords)).catch(onError);

