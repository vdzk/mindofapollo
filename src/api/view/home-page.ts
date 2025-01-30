"use server"

import { getPermission } from "~/getPermission"
import { getUserId } from "../shared/session"
import { onError, sql } from "~/db"
import { injectVirtualValues } from "../shared/select"

interface HpStatement {
  id: number,
  label: string,
  directive?: boolean
}

export const getHomePageStatements = async (
  featured: boolean,
  tagId?: number
) => {
  const userId = await getUserId()
  if (!getPermission(userId, 'read', 'statement').granted) return
  if (!getPermission(userId, 'read', 'directive').granted) return
  let results: HpStatement[] = []

  let statements
  if (featured) {
    statements = await sql`
      SELECT *
      FROM statement
      WHERE featured
    `.catch(onError)
  } else {
    statements = await sql`
      SELECT s.*
      FROM statement s
      JOIN statement_x_tag x
        ON x.statement_id = s.id
      WHERE x.tag_id = ${tagId!}
    `.catch(onError)
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
    `.catch(onError)
  } else {
    directives = await sql`
      SELECT d.id
      FROM directive d
      JOIN directive_x_tag x
        ON x.directive_id = d.id
      WHERE x.tag_id = ${tagId!}
    `.catch(onError)
  }
  if (directives) {
    await injectVirtualValues('directive', directives)
    results = [...results, ...directives.map(({id, label}) => ({
      id, label, directive: true
    }))]
  }

  return results
}
