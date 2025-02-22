import { sql } from "~/server-only/db"
import { getUserSession } from "../../server-only/session"
import { injectVirtualValues } from "../../server-only/select"

interface HpStatement {
  id: number,
  label: string,
  directive?: boolean
}

export const listHomePageStatements = async (
  featured: boolean,
  tagId?: number
) => {
  "use server"
  const userSession = await getUserSession()
  let results: HpStatement[] = []

  let statements
  if (featured) {
    statements = await sql`
      SELECT *
      FROM statement
      WHERE featured
    `
  } else {
    statements = await sql`
      SELECT s.*
      FROM statement s
      JOIN statement_x_tag x
        ON x.statement_id = s.id
      WHERE x.tag_id = ${tagId!}
    `
  }
  if (statements) {
    await injectVirtualValues('statement', statements)
    results = statements as unknown as HpStatement[]
  }

  let directives
  if (featured) {
    directives = await sql`
      SELECT *
      FROM directive
      WHERE featured
    `
  } else {
    directives = await sql`
      SELECT d.id
      FROM directive d
      JOIN directive_x_tag x
        ON x.directive_id = d.id
      WHERE x.tag_id = ${tagId!}
    `
  }
  if (directives) {
    await injectVirtualValues('directive', directives)
    results = [...results, ...directives.map(({id, label}) => ({
      id, label, directive: true
    }))]
  }

  return results
}