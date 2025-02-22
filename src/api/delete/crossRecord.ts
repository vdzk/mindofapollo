import {sql} from "~/server-only/db";
import {xName} from "~/util";
import { belongsTo } from "~/server-only/session";
import { CrossRecordMutateProps } from "../insert/crossRecord";

export const whoCanDeleteCrossRecord = (tableName: string) => {
  if (tableName === 'person') {
    return []
  } else {
    return ['invited']
  }
}

export const deleteCrossRecord = async (
  params: CrossRecordMutateProps
) => {
  "use server"
  if (! await belongsTo(whoCanDeleteCrossRecord(
    params.first ? params.a : params.b
  ))) return
  const tableName = xName(params.a, params.b, params.first)
  const result = await sql`
  DELETE FROM ${sql(tableName)}
  WHERE ${sql(params.a + '_id')} = ${params.a_id}
    AND ${sql(params.b + '_id')} = ${params.b_id}
  RETURNING *
  `
  return result;
}