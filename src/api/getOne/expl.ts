import { personalTableNames } from "~/permissions";
import { onError, sql } from "~/server-only/db";
import { ExplRecord } from "~/server-only/expl";

export const getOneExpl = async (explId: number) => {
  "use server"
  const explResults = await sql`
    SELECT *
    FROM expl
    WHERE id = ${explId}
      AND table_name NOT IN ${sql(personalTableNames)}
  `.catch(onError)
  return explResults?.[0] as ExplRecord<any>
}