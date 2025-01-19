"use server"

import { DataLiteral, DataOp, DataRecord } from "~/schema/type";
import { onError, sql } from "../../db";
import { getUserId } from "./session";
import { listRecords } from "./select";
import { schema } from "~/schema/schema";
import { getValueTypeTableNameByColType } from "~/schema/dataTypes";
import { getTypeByOriginId, getTypeByRecordId } from "./valueType";
import { getPermission } from "~/getPermission";


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
  tableName: string,
  value: DataLiteral,
) => {
  const result = await sql`
    INSERT INTO ${sql(tableName)} (value)
    VALUES (${value})
    RETURNING *
  `
  await writeHistory(userId, 'INSERT', tableName, result[0]);
  return result
}

export const injectValueTypes = async (
  userId: number,
  tableName: string,
  record: DataRecord,
  recordId?: number
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
        const [{id}] = await insertValueType(userId, vttn, value)
        record[colName] = id
      }
    }
  }
}

export const insertRecord = safeWrap(async (
  userId: number,
  tableName: string,
  record: DataRecord
) => {
  const permission = getPermission(userId, 'create', tableName)
  if (!permission.granted) return
  await injectValueTypes(userId, tableName, record)
  const result = await sql`
    INSERT INTO ${sql(tableName)} ${sql(record)}
    RETURNING *
  `;
  await writeHistory(userId, 'INSERT', tableName, result[0]);
  return result;
});

// TODO: implement efficient bulk version
export const writeHistory = async (
  userId: number,
  data_op: DataOp,
  tableName: string,
  record?: DataRecord
) => {
  if (record) {
    await sql`
      INSERT INTO ${sql(tableName + '_h')} ${sql({
        ...record,
        data_op,
        op_user_id: userId
      })}
    `;
  }
};

// TODO: implement an efficient bulk version
export const insertRecordsOneByOne = async (
  tableName: string,
  records: DataRecord[]
) => await Promise.all(
  records.map((record) => insertRecord(tableName, record))
)

export const updateRecord = safeWrap(async (
  userId: number,
  tableName: string,
  id: number,
  record: DataRecord
) => {
  await injectValueTypes(userId, tableName, record, id)
  const result = await sql`
    UPDATE ${sql(tableName)}
    SET ${sql(record, Object.keys(record))}
    WHERE id = ${id}
    RETURNING *
  `;
  await writeHistory(userId, 'UPDATE', tableName, result[0])
});

export const deleteById = safeWrap(async (
  userId: number,
  tableName: string,
  id: number
) => {
  const result = await sql`
    DELETE FROM ${sql(tableName)}
    WHERE id = ${id}
    RETURNING *
  `;
  await writeHistory(userId, 'DELETE', tableName, result[0])
});
export const multiListRecords = (tableNames: string[]) => Promise.all(tableNames.map(listRecords)).catch(onError);

