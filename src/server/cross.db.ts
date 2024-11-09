"use server";
import { sql, onError } from "./db";
import { safeWrap } from "./mutate.db";
import { CrossRecordMutateProps, insertCrossRecordServerOnly, writeHistory, xName } from "./serverOnly";

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
`.catch(onError);

export const insertCrossRecord = safeWrap(insertCrossRecordServerOnly)

export const deleteCrossRecord = safeWrap(async (
  userId: number,
  props: CrossRecordMutateProps
) => {
  const tableName = xName(props.a, props.b, props.first)
  const result = await sql`
    DELETE FROM ${sql(tableName)}
    WHERE ${sql(props.a + '_id')} = ${props.a_id}
      AND ${sql(props.b + '_id')} = ${props.b_id}
    RETURNING *
  `
  writeHistory(userId, 'DELETE', tableName, result[0])
})
