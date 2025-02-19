"use server"

import {sql} from "~/server-only/db";
import {xName} from "~/util";
import { getUserSession } from "../../server-only/session";

export interface CrossRecordMutateProps {
  a: string
  b: string
  first: boolean
  a_id: number
  b_id: number
}

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

export const insertCrossRecord = async (
  props: CrossRecordMutateProps
) => {
  const userSession = await getUserSession()
  const tableName = xName(props.a, props.b, props.first);
  const result = await sql`
  INSERT INTO ${sql(tableName)} (
    ${sql(props.a + '_id')},
    ${sql(props.b + '_id')}
  )
  VALUES (
    ${props.a_id},
    ${props.b_id}
  )
  RETURNING *
  `
  return result;
}
