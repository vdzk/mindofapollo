"use server"

import { getPermission } from "~/getPermission"
import { getUserId } from "../shared/session"
import { onError, sql } from "~/db"
import { injectVirtualValues } from "../shared/select"

interface HpQuestion {
  id: number,
  label: string,
  directive?: boolean
}

export const getHomePageQuestions = async (
  featured: boolean,
  tagId?: number
) => {
  const userId = await getUserId()
  if (!getPermission(userId, 'read', 'question').granted) return
  if (!getPermission(userId, 'read', 'directive').granted) return
  let results: HpQuestion[] = []

  let questions
  if (featured) {
    questions = await sql`
      SELECT *
      FROM question
      WHERE featured
    `.catch(onError)
  } else {
    questions = await sql`
      SELECT q.*
      FROM question q
      JOIN question_x_tag x
        ON x.question_id = q.id
      WHERE x.tag_id = ${tagId!}
    `.catch(onError)
  }
  if (questions) {
    await injectVirtualValues('question', questions)
    results = questions as unknown as HpQuestion[]
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