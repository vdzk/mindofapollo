import { sql } from "./db"

export const startExpl = async (
  user_id: number | null,
  action: string,
  version: number,
  table_name: string | null,
  record_id: number | null
) => {
  const result = await sql`
    INSERT INTO expl ${sql({
      user_id, action, version, table_name, record_id
    })}
    RETURNING id
  `
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
  `
}

export const finishExpl = async (
  explId: number,
  data: Record<string, any>
) => {
  await sql`
    UPDATE expl
    SET data = ${sql.json(data)}
    WHERE id = ${explId}
  `
}