"use server";
import { getUserId } from "~/server-only/session"
import { schema } from "~/schema/schema"
import { sql } from "~/server-only/db";
import { injectVirtualValues } from "~/server-only/select";


export const listRecords = async (tableName: string) => {
  const userId = await getUserId();
  const { personal } = schema.tables[tableName];
  if (personal && !userId) {
    return [];
  }

  const records = await sql`
    SELECT t.*
    FROM ${sql(tableName)} t
    ORDER BY t.id
  `;
  await injectVirtualValues(tableName, records);
  return records;
};
