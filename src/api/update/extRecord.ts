import { DataRecord } from "~/schema/type"
import { _updateRecord } from "../../server-only/mutate"
import { startExpl, finishExpl } from "~/server-only/expl"
import { getUserActorUser, getUserSession } from "../../server-only/session"
import { ExplData, ExplDiff, UserActor } from "~/components/expl/types"
import { titleColumnName } from "~/utils/schema"
import { _getRecordById } from "~/server-only/select"
import { authorisedUpdate } from "./record"
import { allowedTableContent } from "~/server-only/moderate"

export const updateExtRecord = async (
  tableName: string,
  id: number,
  record: DataRecord,
  extTableName: string,
  extRecord: DataRecord,
  userExpl: string
) => {
  "use server"

  const {userId, authRole} = await getUserSession()
  if (!(await authorisedUpdate(tableName, id, record, userId, authRole))) return
  if (! await allowedTableContent(tableName, record)) return

  const explId = await startExpl(userId, 'updateExtRecord', 1, tableName, id)
  const [recordDiff, extRecordDiff] = await Promise.all([
    _updateRecord(tableName, id, explId, record),
    _updateRecord(extTableName, id, explId, extRecord),
  ])

  const user = await getUserActorUser()
  const originalRecord = await _getRecordById(tableName, id)
  if (!originalRecord) return
  const data: UpdateExtRecordData = {
    tableName,
    extTableName,
    record: recordDiff,
    extRecord: extRecordDiff,
    user,
    id,
    targetLabel: originalRecord[titleColumnName(tableName)] as string,
    userExpl
  }
  await finishExpl(explId, data)

  return [recordDiff, extRecordDiff]
}

interface UpdateExtRecordData {
  tableName: string
  extTableName: string
  record: ExplDiff<DataRecord>
  extRecord: ExplDiff<DataRecord>
  user: UserActor['user']
  id: number
  targetLabel: string
  userExpl: string
}

export const explUpdateExtRecord = (data: UpdateExtRecordData): ExplData => ({
  actor: { type: 'user', user: data.user },
  action: 'updated',
  target: {
    tableName: data.tableName,
    id: data.id,
    label: data.targetLabel
  },
  updatedRecords: {
    [data.tableName]: [{ ...data.record, id: data.id }],
    [data.extTableName]: [{ ...data.extRecord, id: data.id }]
  },
  userExpl: data.userExpl
})