"use server"

import { sql } from "~/db";
import { schema } from "~/schema/schema";
import { safeWrap } from "../shared/mutate";
import { UserSession } from "~/types";

interface ExplRecord {
  id: number;
  user_id: number;
  action: string;
  version: number;
  table_name: string | null;
  record_id: number | null;
  data: any;
  timestamp: string;
}

interface ActivityRecord extends ExplRecord {
  title_text: string | null;
}

const getFirstTextColumn = (tableName: string): string | null => {
  const { columns } = schema.tables[tableName];
  for (const [colName, column] of Object.entries(columns)) {
    if (column.type === 'varchar' || column.type === 'text') {
      return colName;
    }
  }
  return null;
}

export const getUserActivity = safeWrap(async (
  userSession: UserSession,
  userId: number
): Promise<ActivityRecord[]> => {
  const activity = await sql<ExplRecord[]>`
    SELECT *
    FROM expl 
    WHERE user_id = ${userId}
    ORDER BY id DESC
  `;

  const activityRecords: ActivityRecord[] = activity.map(record => ({
    ...record,
    title_text: null
  }));

  // Group records by table_name
  const recordsByTable = new Map<string, ActivityRecord[]>();
  activityRecords.forEach(record => {
    if (record.table_name && record.record_id) {
      if (!recordsByTable.has(record.table_name)) {
        recordsByTable.set(record.table_name, []);
      }
      recordsByTable.get(record.table_name)!.push(record);
    }
  });

  // Fetch titles for each table in one query
  for (const [tableName, records] of recordsByTable) {
    const table = schema.tables[tableName];
    if (table) {
      const titleCol = getFirstTextColumn(tableName);
      if (!titleCol) continue;

      const recordIds = records.map(r => r.record_id);
      const query = `
        SELECT id, ${titleCol} as title
        FROM ${tableName}
        WHERE id = ANY($1::integer[])
      `;
      
      const titleResults = await sql.unsafe<{id: number, title: string | null}[]>(query, [recordIds]);

      // Create a map for quick lookup
      const titlesById = new Map(titleResults.map(r => [r.id, r.title]));
      
      // Update the activity records with their titles
      records.forEach(record => {
        record.title_text = record.record_id ? titlesById.get(record.record_id) ?? null : null;
      });
    }
  }

  return activityRecords;
});