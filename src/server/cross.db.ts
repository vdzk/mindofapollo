"use server";
import { sql, onError } from "./db";

const xName = (a: string, b: string, first?: boolean) => (first ? [a, b] : [b, a]).join('_x_');

export interface CrossRecordMutateProps {
  a: string
  b: string
  first: boolean
  a_id: string
  b_id: string
}

export const insertCrossRecord = (props: CrossRecordMutateProps) => sql`
  INSERT INTO ${sql(xName(props.a, props.b, props.first))}
    (${sql(props.a + '_id')}, ${sql(props.b + '_id')})
  VALUES (${props.a_id}, ${props.b_id})
`.catch(onError);

export const listCrossRecords = (
  b: string,
  a: string,
  id: string,
  first: boolean
) => sql`
  SELECT ${sql(b)}.*
  FROM ${sql(b)}
  JOIN ${sql(xName(a, b, first))} ON ${sql(b + '_id')} = id
  WHERE ${sql(a + '_id')} = ${id}
  ORDER BY id
`.catch(onError);

export const deleteCrossRecord = (props: CrossRecordMutateProps) => sql`
  DELETE FROM ${sql(xName(props.a, props.b, props.first))}
  WHERE ${sql(props.a + '_id')} = ${props.a_id}
    AND ${sql(props.b + '_id')} = ${props.b_id}
`.catch(onError);
