import { DataLiteral } from "~/schema/type"
import { sql } from "~/server-only/db";

export const getOneIdByRecord = async (tableName: string, record: Record<string, DataLiteral>) => {
  "use server"
  if (Object.keys(record).length === 0) {
    return undefined;
  }

  const conditions = Object.entries(record).map(
    ([key, value]) => sql`${sql(key)} = ${value}`
  );

  const whereClause = conditions.reduce(
    (acc, condition, idx) => idx === 0 ? condition : sql`${acc} AND ${condition}`
  );

  const results = await sql`
    SELECT id
    FROM ${sql(tableName)}
    WHERE ${whereClause}
  `;
  return results?.[0]?.id as number;
};