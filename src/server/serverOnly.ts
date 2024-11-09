//Moving functions here was a workaround for the following
//Error: Client-only API called on the server side. Run client-only code in onMount, or conditionally run client-only component with <Show>.

import { DataOp, DataRecord } from "~/schema/type";
import { sql } from "./db";


export const xName = (a: string, b: string, first?: boolean) => (first ? [a, b] : [b, a]).join('_x_');

export interface CrossRecordMutateProps {
  a: string;
  b: string;
  first: boolean;
  a_id: number;
  b_id: number;
}

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

// Warning: AVOID importing on client. userId must be set on the server.
export const insertRecordServerOnly = async (
  userId: number,
  tableName: string,
  record: DataRecord
) => {
  const result = await sql`
    INSERT INTO ${sql(tableName)} ${sql(record)}
    RETURNING *
  `;
  await writeHistory(userId, 'INSERT', tableName, result[0]);
  return result;
};

// Warning: AVOID importing on client. userId must be set on the server.
export const insertCrossRecordServerOnly = async (
  userId: number,
  props: CrossRecordMutateProps
) => {
  const tableName = xName(props.a, props.b, props.first);
  const result = await sql`
    INSERT INTO ${sql(tableName)}
      (${sql(props.a + '_id')}, ${sql(props.b + '_id')})
    VALUES (${props.a_id}, ${props.b_id})
    RETURNING *
  `;
  writeHistory(userId, 'INSERT', tableName, result[0]);
};

