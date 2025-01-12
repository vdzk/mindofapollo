"use server"

import { schema } from "~/schema/schema";
import { onError, sql } from "../../db";
import { HistoryRecord } from "~/schema/type";

export const listRecordHistory = (
  tableName: string,
  recordId: number
) => sql`
  SELECT h.*, person.name AS op_user_name
  FROM ${sql(tableName + '_h')} h
  JOIN person ON person.id = h.op_user_id
  WHERE h.id = ${recordId}
  ORDER BY op_timestamp
`.catch(onError)

export const listUserHistory = (
  userId: number
) => Promise.all(
  Object.keys(schema.tables).map(tableName => sql`
    SELECT *
    FROM ${sql(tableName + '_h')}
    WHERE op_user_id = ${userId}
  `.then(result => (result as unknown as HistoryRecord[])
    .map(record => ({ tableName, ...record })))
  )
).then(results => results.flat().sort((a, b) =>
  b.op_timestamp.getTime() - a.op_timestamp.getTime())
).catch(onError)
