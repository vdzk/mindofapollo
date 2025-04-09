import { deleteByIdsCascade } from "../../server-only/mutate"
import { belongsTo, getUserId, getUserActorUser } from "~/server-only/session"
import { ExplData, UserActor } from "~/components/expl/types"
import { finishExpl, startExpl } from "~/server-only/expl"
import { DataRecordWithId } from "~/schema/type"

export const whoCanDeleteByIds = (tableName: string) => {
  return []
}

export const deleteByIds = async (tableName: string, ids: number[], userExpl: string) => {
  "use server"
  if (! await belongsTo(whoCanDeleteByIds(tableName))) return
  
  const userId = await getUserId()
  const explId = await startExpl(userId, 'deleteByIds', 1, tableName, null)
  const deletedRecords = await deleteByIdsCascade(tableName, 'id', ids, explId)

  const user = await getUserActorUser()
  const data: DeleteByIdsData = { 
    tableName,
    ids, 
    targetLabel: ids.join(", "), 
    user,
    deletedRecords,
    userExpl
  }
  await finishExpl(explId, data)
}

export interface DeleteByIdsData {
  tableName: string
  ids: number[]
  targetLabel: string
  user: UserActor['user']
  deletedRecords: Record<string, DataRecordWithId[]>
  userExpl: string
}

export const explDeleteByIds = (data: DeleteByIdsData): ExplData => ({
  actor: { type: 'user', user: data.user },
  action: 'bulk deleted',
  target: {
    tableName: data.tableName,
    id: 0,
    label: data.targetLabel
  },
  deletedRecords: data.deletedRecords,
  userExpl: data.userExpl
})
