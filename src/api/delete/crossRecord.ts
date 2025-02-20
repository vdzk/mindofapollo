"use server"

import {sql} from "~/server-only/db";
import {xName} from "~/util";
import { getUserSession } from "~/server-only/session";
import { CrossRecordMutateProps } from "../insert/crossRecord";

export const deleteCrossRecord = async (
  params: CrossRecordMutateProps
) => {
  const userSession = await getUserSession()
  const tableName = xName(params.a, params.b, params.first)
  const result = await sql`
  DELETE FROM ${sql(tableName)}
  WHERE ${sql(params.a + '_id')} = ${params.a_id}
    AND ${sql(params.b + '_id')} = ${params.b_id}
  RETURNING *
  `
  return result;
}