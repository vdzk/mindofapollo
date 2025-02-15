"use server"

import {safeWrap} from "~/api/shared/mutate";
import {sql} from "~/db";
import {xName} from "~/util";
import { UserSession } from "~/types";

export interface CrossRecordMutateProps {
  a: string;
  b: string;
  first: boolean;
  a_id: number;
  b_id: number;
}

export const deleteCrossRecord = safeWrap(async (
  userSession: UserSession,
  params: CrossRecordMutateProps
) => {
  const tableName = xName(params.a, params.b, params.first)
  const result = await sql`
  DELETE FROM ${sql(tableName)}
  WHERE ${sql(params.a + '_id')} = ${params.a_id}
    AND ${sql(params.b + '_id')} = ${params.b_id}
  RETURNING *
  `
  return result;
})

export const insertCrossRecord = safeWrap(async (
  userSession: UserSession,
  props: CrossRecordMutateProps
) => {
  const tableName = xName(props.a, props.b, props.first);
  const result = await sql`
  INSERT INTO ${sql(tableName)}
    (${sql(props.a + '_id')}, ${sql(props.b + '_id')})
  VALUES (${props.a_id}, ${props.b_id})
  RETURNING *
  `;
  return result;
})
