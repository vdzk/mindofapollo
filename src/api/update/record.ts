import { DataRecord } from "~/schema/type"
import { belongsTo, getUserSession } from "../../server-only/session"
import { _updateRecord, injectValueTypes } from "~/server-only/mutate"
import { finishExpl, startExpl } from "~/server-only/expl"
import chalk from "chalk"
import { getWritableColNames, isPrivate } from "~/permissions"
import { ofSelf } from "~/server-only/ofSelf"
import { hasOwnFields } from "~/util"

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
  const explId = await startExpl(userId, 'genericChange', 1, tableName, id);
  const diff = await _updateRecord(tableName, id, explId, record)
  await finishExpl(explId, {diff})
}