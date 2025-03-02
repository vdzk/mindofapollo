import { DataRecord } from "~/schema/type"
import { belongsTo, getUserSession } from "../../server-only/session"
import { _updateRecord, injectValueTypes } from "~/server-only/mutate"
import { finishExpl, startExpl } from "~/server-only/expl"
import chalk from "chalk"
import { getWritableColNames, isPrivate } from "~/permissions"
import { ofSelf } from "~/server-only/ofSelf"
import { hasOwnFields } from "~/util"
import { ExplData, ExplDiff, UserActor } from "~/components/expl/types"
import { titleColumnName } from "~/util"
import { getUserActorUser } from "../../server-only/session"
import { _getRecordById } from "~/server-only/select"

export const whoCanUpdateRecord = (tableName: string, ofSelf: boolean) => {
  if (!hasOwnFields(tableName)) {
    return []
  } else if (isPrivate(tableName) && !ofSelf) {
    return []
  } else {
    return ['invited']
  }
}

export const updateRecord = async (
  tableName: string,
  id: number,
  record: DataRecord
) => {
  "use server"
  if (! await belongsTo(whoCanUpdateRecord(
    tableName, await ofSelf(tableName, id)
  ))) return

  const {userId, authRole} = await getUserSession()
  const writableColNames = getWritableColNames(tableName, authRole)
  const forbiddenColumn = Object.keys(record)
    .find(colName => !writableColNames.includes(colName))
  if (forbiddenColumn) {
    console.trace()
    console.log(chalk.red('ERROR'), { forbiddenColumn })
    return
  }
  await injectValueTypes(tableName, record, id)
  const explId = await startExpl(userId, 'updateRecord', 1, tableName, id);
  const diff = await _updateRecord(tableName, id, explId, record)
  const user = await getUserActorUser()
  const originalRecord = await _getRecordById(tableName, id)
  if (!originalRecord) return
  const data: UpdateRecordData = {
    tableName,
    diff,
    user,
    id,
    targetLabel: originalRecord[titleColumnName(tableName)] as string
  }
  await finishExpl(explId, explUpdateRecord(data))
  return diff
}

interface UpdateRecordData {
  tableName: string
  diff: ExplDiff<DataRecord>
  user: UserActor['user']
  id: number
  targetLabel: string
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
  }
})