"use server";
import { sql, onError } from "./db";

const xName = (a: string, b: string, first?: boolean) => (first ? [a, b] : [b, a]).join('_x_');

export const insertCrossRecord = (
  a: string,
  b: string,
  first: boolean,
  a_id: string,
  b_id: string
) => sql`
  INSERT INTO ${sql(xName(a, b, first))}
    (${sql(a + '_id')}, ${sql(b + '_id')})
  VALUES (${a_id}, ${b_id})
`.catch(onError);

export const listCrossRecords = (
  b: string,
  a: string,
  id: string,
  first?: boolean
) => sql`
  SELECT ${sql(b)}.*
  FROM ${sql(b)}
  JOIN ${sql(xName(a, b, first))} ON ${sql(b + '_id')} = id
  WHERE ${sql(a + '_id')} = ${id}
  ORDER BY id
`.catch(onError);

export const deleteCrossRecord = (
  a: string,
  b: string,
  first: boolean,
  a_id: string,
  b_id: string
) => sql`
  DELETE FROM ${sql(xName(a, b, first))}
  WHERE ${sql(a + '_id')} = ${a_id}
    AND ${sql(b + '_id')} = ${b_id}
`.catch(onError);
