import { schema } from "~/schema/schema"
import { ValueTypeIdColumn } from "~/schema/type"
import { onError, sql } from "./db"

export const getTypeByOriginId = async (
  tableName: string,
  colName: string,
  originId: number
) => {
  const query = (schema.tables[tableName].columns[colName] as ValueTypeIdColumn).getTypeByOriginIdQuery
  const results = await sql.unsafe(query, [originId]).catch(onError)
  return results?.[0]?.value_type
}

export const getTypeByRecordId = async (
  tableName: string,
  colName: string,
  recordId: number
) => {
  const query = (schema.tables[tableName].columns[colName] as ValueTypeIdColumn).getTypeByRecordIdQuery
  const results = await sql.unsafe(query, [recordId]).catch(onError)
  return results?.[0]?.value_type
}
