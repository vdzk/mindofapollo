import { _deleteById } from "../../server-only/mutate"
import { _getRecordById } from "../../server-only/select"
import { getExtTableName, titleColumnName } from "~/util"
import { belongsTo, getUserId, getUserActorUser } from "~/server-only/session"
import { ofSelf } from "~/server-only/ofSelf"
import { ExplData, UserActor } from "~/components/expl/types"
import { finishExpl, startExpl } from "~/server-only/expl"
import { DataRecordWithId } from "~/schema/type"
import { isPersonal } from "~/permissions"

export const whoCanDeleteExtById = (tableName: string, ofSelf: boolean) => {
  if (tableName === 'person' || (isPersonal(tableName) && !ofSelf)) {
    return []
  } else {
    return ['invited']
  }
}

export const deleteExtById = async (tableName: string, id: number) => {
  "use server"
  if (! await belongsTo(whoCanDeleteExtById(
    tableName,
    await ofSelf(tableName, id)
  ))) return
  
  const userId = await getUserId()
  const record = await _getRecordById(tableName, id)
  if (!record) return

  const extTableName = getExtTableName(tableName, record)
  const extRecord = extTableName ? await _getRecordById(extTableName, id) : undefined

  const explId = await startExpl(userId, 'deleteExtById', 1, tableName, id)
  await _deleteById(tableName, id)
  if (extTableName && extRecord) {
    await _deleteById(extTableName, id)
  }

  const user = await getUserActorUser()
  const targetLabel = record[titleColumnName(tableName)] as string
  const data: DeleteExtByIdData = { 
    tableName, 
    extTableName, 
    id, 
    targetLabel, 
    user, 
    record,
    extRecord
  }
  await finishExpl(explId, data)
}

export interface DeleteExtByIdData {
  tableName: string
  extTableName?: string
  id: number
  targetLabel: string
  user: UserActor['user']
  record: DataRecordWithId
  extRecord?: DataRecordWithId
}

export const explDeleteExtById = (data: DeleteExtByIdData): ExplData => ({
  actor: { type: 'user', user: data.user },
  action: 'deleted',
  target: {
    tableName: data.tableName,
    id: data.id,
    label: data.targetLabel
  },
  deletedRecords: {
    [data.tableName]: [data.record],
    ...(data.extTableName && data.extRecord ? {[data.extTableName]: [data.extRecord]} : {})
  }
})