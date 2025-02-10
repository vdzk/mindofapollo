"use server"

import { onError, sql } from "~/db"

export const getExpl = async (explId: number) => {
  const explResults = await sql`
    SELECT *
    FROM expl
    WHERE id = ${explId}
  `.catch(onError)
  return explResults?.[0]
}