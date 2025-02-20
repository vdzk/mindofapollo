"use server"

import { DataRecordWithId } from "~/schema/type";
import { sql } from "~/server-only/db";
import { injectVirtualValues } from "~/server-only/select";

export const listRecords = async (tableName: string) => {

  const records = await sql`
    SELECT t.*
    FROM ${sql(tableName)} t
    ORDER BY t.id
  `;
  await injectVirtualValues(tableName, records);
  return records as unknown as DataRecordWithId[]
};