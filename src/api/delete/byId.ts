import { belongsTo, getUserId, getUserActorUser } from "~/server-only/session"
import { ofSelf } from "~/server-only/ofSelf"
import { _deleteById } from "~/server-only/mutate"
import { finishExpl, startExpl } from "~/server-only/expl"
import { _getRecordById } from "~/server-only/select"
import { titleColumnName } from "~/utils/schema"
import { DeleteExtByIdData, explDeleteExtById, whoCanDeleteExtById } from "./extById"

export const whoCanDeleteById = whoCanDeleteExtById

export const deleteById = async (
  tableName: string,
  id: number
) => {
  "use server"
  if (! await belongsTo(whoCanDeleteById(
    tableName,
    await ofSelf(tableName, id)
  ))) return

  const userId = await getUserId()
  const record = await _getRecordById(tableName, id)
  if (!record) return

  const explId = await startExpl(userId, 'deleteById', 1, tableName, id)
  await _deleteById(tableName, id)

  const user = await getUserActorUser()
  const targetLabel = record[titleColumnName(tableName)] as string
  const data: DeleteExtByIdData = { tableName, id, targetLabel, user, record }
  await finishExpl(explId, data)
}

export const explDeleteById = explDeleteExtById