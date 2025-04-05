import { onError, sql } from "~/server-only/db"
import { getUserId } from "~/server-only/session"
import { injectVirtualValues } from "../../server-only/select"
import { injectTranslations } from "../../server-only/injectTranslations"
import { DataRecordWithId } from "~/schema/type"

export const listHomePageStatements = async (
  featured: boolean,
  tagId?: number
) => {
  "use server"
  const userId = await getUserId()

  // Common subscription subquery
  const subscriptionSubquery = sql`(
    SELECT subscribed
    FROM subscription 
    WHERE person_id = ${userId}
      AND statement_id = s.id
  ) AS subscribed`

  // Statement query - with condition based on featured or tagId
  const whereClause = featured 
    ? sql`WHERE featured`
    : sql`
      JOIN statement_x_tag x
        ON x.statement_id = s.id
      WHERE x.tag_id = ${tagId!}
    `

  const statements = await sql<DataRecordWithId[]>`
    SELECT s.*, ${subscriptionSubquery}
    FROM statement s
    ${whereClause}
  `.catch(onError)

  await injectTranslations('statement', statements)
  await injectVirtualValues('statement', statements)
  await injectVirtualValues('directive', statements.filter( statement => 
    statement.argument_aggregation_type_name === 'normative'
  ))

  return statements
}