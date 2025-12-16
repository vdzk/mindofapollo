import { DataRecord, DataRecordWithId } from "~/schema/type"
import { getUserSession } from "../../server-only/session"
import { _updateRecord } from "~/server-only/mutate"
import { finishExpl, startExpl } from "~/server-only/expl"
import { getWritableColNames } from "~/permissions"
import { ExplData, ExplDiff, UserActor } from "~/components/expl/types"
import { titleColumnName } from "~/utils/schema"
import { getUserActorUser } from "../../server-only/session"
import { _getRecordById } from "~/server-only/select"
import { printError } from "../../server-only/db"
import { AuthRole } from "~/types"
import { allowedTableContent } from "~/server-only/moderate"
import { canUpdate } from "~/server-only/permissions"

export const authorisedUpdate = async (
  tableName: string,
  originalRecord: DataRecordWithId,
  record: DataRecord,
  authRole: AuthRole
) => {
  "use server" // This is a hack to avoid vinxi blowing up. It should not be called from the client.
  if (! await canUpdate(tableName, [originalRecord.id])) return false

  const writableColNames = getWritableColNames(tableName, { record: originalRecord }, authRole)
  const forbiddenColumn = Object.keys(record)
    .find(colName => !writableColNames.includes(colName))
  if (forbiddenColumn) {
    console.trace()
    printError('Forbidden column', { forbiddenColumn })
    return false
  }
  return true
}

export const updateRecord = async (
  tableName: string,
  id: number,
  record: DataRecord,
  userExpl: string
) => {
  "use server"
  const {userId, authRole} = await getUserSession()
  const originalRecord = await _getRecordById(tableName, id)
  if (!originalRecord) return
  if (!(await authorisedUpdate(tableName, originalRecord, record, authRole))) return
  if (! await allowedTableContent(tableName, record)) {
    throw new Error('You content didn\'t pass the filter.')
  }
  
  const explId = await startExpl(userId, 'updateRecord', 1, tableName, id)
  const diff = await _updateRecord(tableName, id, explId, record)
  const user = await getUserActorUser()
  const data: UpdateRecordData = {
    tableName,
    diff,
    user,
    id,
    targetLabel: originalRecord[titleColumnName(tableName)] as string,
    userExpl
  }
  await finishExpl(explId, data)
  return diff
}

interface UpdateRecordData {
  tableName: string
  diff: ExplDiff<DataRecord>
  user: UserActor['user']
  id: number
  targetLabel: string
  userExpl: string
}

export const explUpdateRecord = (data: UpdateRecordData): ExplData => ({
  actor: { type: 'user', user: data.user },
  action: 'updated',
  target: {
    tableName: data.tableName,
    id: data.id,
    label: data.targetLabel
  },
  updatedRecords: {
    [data.tableName]: [{...data.diff, id: data.id}]
  },
  userExpl: data.userExpl
})