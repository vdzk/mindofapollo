import { deleteByIdsCascade } from "../../server-only/mutate"
import { _getRecordById } from "../../server-only/select"
import { titleColumnName } from "~/utils/schema"
import { belongsTo, getUserId, getUserActorUser } from "~/server-only/session"
import { ofSelf } from "~/server-only/ofSelf"
import { ExplData, UserActor } from "~/components/expl/types"
import { finishExpl, startExpl } from "~/server-only/expl"
import { DataRecordWithId } from "~/schema/type"
import { isPersonal } from "~/permissions"

export const whoCanDeleteById = (tableName: string, ofSelf: boolean) => {
  if (tableName === 'person' || (isPersonal(tableName) && !ofSelf)) {
    return []
  } else {
    return ['invited']
  }
}

export const deleteById = async (tableName: string, id: number, userExpl: string) => {
  "use server"
  if (! await belongsTo(whoCanDeleteById(
    tableName,
    await ofSelf(tableName, id)
  ))) return
  
  const userId = await getUserId()
  const record = await _getRecordById(tableName, id)
  if (!record) return

  const explId = await startExpl(userId, 'deleteById', 1, tableName, id)
  const deletedRecords = await deleteByIdsCascade(tableName, 'id', [id], explId)

  const user = await getUserActorUser()
  const targetLabel = record[titleColumnName(tableName)] as string
  const data: DeleteByIdData = { 
    tableName,
    id, 
    targetLabel, 
    user,
    deletedRecords,
    userExpl
  }
  await finishExpl(explId, data)
}

export interface DeleteByIdData {
  tableName: string
  id: number
  targetLabel: string
  user: UserActor['user']
  deletedRecords: Record<string, DataRecordWithId[]>
  userExpl: string
}

export const explDeleteById = (data: DeleteByIdData): ExplData => ({
  actor: { type: 'user', user: data.user },
  action: 'deleted',
  target: {
    tableName: data.tableName,
    id: data.id,
    label: data.targetLabel
  },
  deletedRecords: data.deletedRecords,
  userExpl: data.userExpl
})