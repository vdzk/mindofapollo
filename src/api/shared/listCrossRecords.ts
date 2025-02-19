"use server";
import { xName } from "~/util";
import { sql } from "./db";
import { injectVirtualValues } from "./select";

export const listCrossRecords = async (
  b: string,
  a: string,
  id: number,
  first: boolean
) => {
  const records = await sql`
    SELECT ${sql(b)}.*
    FROM ${sql(b)}
    JOIN ${sql(xName(a, b, first))} ON ${sql(b + '_id')} = id
    WHERE ${sql(a + '_id')} = ${id}
    ORDER BY id
  `;
  if (records) {
    await injectVirtualValues(b, records);
    return records;
  }
};
