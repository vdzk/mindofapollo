import { sql } from "~/server-only/db";
import { ExplRecord } from "~/server-only/expl";

export const getOneExpl = async (explId: number) => {
  "use server"
  const explResults = await sql`
    SELECT *
    FROM expl
    WHERE id = ${explId}
  `
  return explResults?.[0] as ExplRecord
}