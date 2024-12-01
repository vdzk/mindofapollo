"use server";
import {onError, sql} from "./db";
import {safeWrap, writeHistory} from "./mutate.db";

export interface CrossRecordMutateProps {
    a: string;
    b: string;
    first: boolean;
    a_id: number;
    b_id: number;
}

export const xName = (a: string, b: string, first?: boolean) => (first ? [a, b] : [b, a]).join('_x_');
export const hasCrossRecord = (
  params: CrossRecordMutateProps
) => sql`
  SELECT 1
  FROM ${sql(xName(params.a, params.b, params.first))}
  WHERE ${sql(params.a + '_id')} = ${params.a_id}
    AND ${sql(params.b + '_id')} = ${params.b_id}
`.then(result => result.length > 0).catch(onError)

export const listCrossRecords = (
  b: string,
  a: string,
  id: number,
  first: boolean
) => sql`
  SELECT ${sql(b)}.*
  FROM ${sql(b)}
  JOIN ${sql(xName(a, b, first))} ON ${sql(b + '_id')} = id
  WHERE ${sql(a + '_id')} = ${id}
  ORDER BY id
`.catch(onError)

export const countCrossRecords = (params: {
  a: string,
  b: string,
  first: boolean,
  id: number
}) => sql`
  SELECT COUNT(*)::int as count
  FROM ${sql(xName(params.a, params.b, params.first))}
  WHERE ${sql(params.a + '_id')} = ${params.id}
`.then(result => result[0].count).catch(onError)

export const insertCrossRecord = safeWrap(async (
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
})

export const deleteCrossRecord = safeWrap(async (
  userId: number,
  params: CrossRecordMutateProps
) => {
  const tableName = xName(params.a, params.b, params.first)
  const result = await sql`
    DELETE FROM ${sql(tableName)}
    WHERE ${sql(params.a + '_id')} = ${params.a_id}
      AND ${sql(params.b + '_id')} = ${params.b_id}
    RETURNING *
  `
  writeHistory(userId, 'DELETE', tableName, result[0])
})
