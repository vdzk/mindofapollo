import { onError, sql } from "~/server-only/db"
import { getUserId, getUserSession } from "../../server-only/session"
import { injectVirtualValues } from "../../server-only/select"

interface HpStatement {
  id: number,
  label: string,
  directive?: boolean,
  subscribed?: boolean | null
}

export const listHomePageStatements = async (
  featured: boolean,
  tagId?: number
) => {
  "use server"
  let results: HpStatement[] = []
  const userId = await getUserId()

  // TODO: query and revalidate subscriptions via a separate endpoint and merge the subscription indicator in the UI? 
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

  const statements = await sql`
    SELECT s.*, ${subscriptionSubquery}
    FROM statement s
    ${whereClause}
  `.catch(onError)

  if (statements) {
    await injectVirtualValues('statement', statements)
    results = statements as unknown as HpStatement[]
  }

  // Directive query - with condition based on featured or tagId
  const directiveWhereClause = featured 
    ? sql`WHERE featured`
    : sql`
      JOIN directive_x_tag x
        ON x.directive_id = d.id
      WHERE x.tag_id = ${tagId!}
    `

  const directives = await sql`
    SELECT d.*
    FROM directive d
    ${directiveWhereClause}
  `.catch(onError)

  if (directives) {
    await injectVirtualValues('directive', directives)
    results = [...results, ...directives.map(({id, label}) => ({
      id, label, directive: true,
      subscribed: null
    }))]
  }

  return results
}