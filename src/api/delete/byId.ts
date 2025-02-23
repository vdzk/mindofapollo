import { belongsTo, getUserId } from "~/server-only/session"
import { isPersonal } from "~/permissions"
import { ofSelf } from "~/server-only/ofSelf"
import { _deleteById } from "~/server-only/mutate"
import { UserActor } from "~/components/expl/types"
import { finishExpl, startExpl } from "~/server-only/expl"
import { _getRecordById } from "~/server-only/select"
import { titleColumnName } from "~/util"
import { DeleteExtByIdData, explDeleteExtById } from "./extById"

export const whoCanDeleteById = (tableName: string, ofSelf: boolean) => {
  if (tableName === 'person' || (isPersonal(tableName) && !ofSelf)) {
    return []
  } else {
    return ['invited']
  }
}

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

  const user = await _getRecordById('person', userId, ['id', 'name', 'auth_role'], false) as UserActor['user']
  const targetLabel = record[titleColumnName(tableName)] as string
  const data: DeleteExtByIdData = { tableName, id, targetLabel, user, record }
  await finishExpl(explId, data)
}

export const explDeleteById = explDeleteExtById