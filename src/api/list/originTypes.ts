import { schema } from "~/schema/schema";
import { ValueTypeIdColumn, ColumnType } from "~/schema/type";
import { onError, sql } from "~/server-only/db";

export const listOriginTypes = async (tableName: string, colName: string) => {
  "use server"
  const query = (schema.tables[tableName].columns[colName] as ValueTypeIdColumn).getOriginTypesQuery;
  const results = await sql.unsafe(query).catch(onError);
  if (results) {
    return Object.fromEntries(results.map(
      record => [record.id, record.value_type]
    )) as Record<number, ColumnType>;
  }
};