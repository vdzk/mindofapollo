"use server"

import { sql } from "~/server-only/db"

export const getOneExpl = async (explId: number) => {
  const explResults = await sql`
    SELECT *
    FROM expl
    WHERE id = ${explId}
  `
  return explResults?.[0]
}