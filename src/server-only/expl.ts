import { onError, sql } from "~/db"

export const startExpl = async (
  userId: number | null,
  action: string,
  version: number,
  tableName: string | null,
  recordId: number | null
) => {
  const result = await sql`
    INSERT INTO expl ${sql({
      userId, action, version, tableName, recordId
    })}
    RETURNING id
  `.catch(onError)
  return result![0].id as number
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