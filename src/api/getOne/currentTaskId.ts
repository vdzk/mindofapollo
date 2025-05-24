import { onError, sql } from "~/server-only/db"
import { inProgressStatus, nextUpStatus } from "~/tables/other/task"

export const getOneCurrentTaskId = async () => {
  "use server"

  const [inProgressTask] = await sql`
    SELECT id
    FROM task
    WHERE status = ${inProgressStatus}
    ORDER BY id ASC
    LIMIT 1
  `.catch(onError)

  if (inProgressTask) return inProgressTask?.id

  const [nextUpTask] = await sql`
    SELECT id
    FROM task
    WHERE status = ${nextUpStatus}
    ORDER BY id ASC
    LIMIT 1
  `.catch(onError)

  if (nextUpTask) return nextUpTask?.id
}