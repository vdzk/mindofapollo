"use server";
import { sql, onError } from "./db";
import { safeWrap } from "./mutate.db";
import { CrossRecordMutateProps as CrossRecordMutateParams, insertCrossRecordServerOnly, writeHistory, xName } from "./serverOnly";

export const hasCrossRecord = (
  params: CrossRecordMutateParams
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

export const insertCrossRecord = safeWrap(insertCrossRecordServerOnly)

export const deleteCrossRecord = safeWrap(async (
  userId: number,
  params: CrossRecordMutateParams
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
