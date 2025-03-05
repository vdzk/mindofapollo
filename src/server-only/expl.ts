import { onError, sql } from "./db"

export interface ExplRecord<T> {
  id: number
  timestamp: Date
  user_id: number | null
  action: string
  version: number
  table_name: string | null
  record_id: number | null
  data: T
}

export const startExpl = async (
  user_id: number | null,
  action: string,
  version: number,
  table_name: string | null,
  record_id: number | null
) => {
  const result = await sql`
    INSERT INTO expl ${sql({
      user_id, action, version, table_name, record_id, 
      timestamp: sql`CURRENT_TIMESTAMP` as any
    })}
    RETURNING id
  `.catch(onError)
  return result![0].id as number
}

export const setExplRecordId = async (
  explId: number,
  record_id: number
) => {
  await sql`
    UPDATE expl
    SET record_id = ${record_id}
    WHERE id = ${explId}
  `.catch(onError)
}

export const finishExpl = async (
  explId: number,
  data: Record<string, any>
) => {
  await sql`
    UPDATE expl
    SET data = ${data as any}
    WHERE id = ${explId}
  `.catch(onError)
}