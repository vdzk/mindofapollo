import { DataRecord } from "~/schema/type"
import { getUserSession } from "../../server-only/session"
import { getPermission } from "~/getPermission"
import chalk from "chalk"
import { _updateRecord, injectValueTypes } from "~/server-only/mutate"
import { finishExpl, startExpl } from "~/server-only/expl"

export const updateRecord = async (
  tableName: string,
  id: number,
  record: DataRecord
) => {
  const userSession = await getUserSession()
  const permission = getPermission(userSession, 'update', tableName, id)
  if (!permission.granted) return
  if (permission.colNames) {
    const forbiddenColumn = Object.keys(record)
      .find(colName => !permission.colNames!.includes(colName))
    if (forbiddenColumn) {
      // TODO: return and process error on the client
      console.trace()
      console.log(chalk.red('ERROR'), { forbiddenColumn })
      return
    }
  }
  await injectValueTypes(tableName, record, id)
  const explId = await startExpl(userSession.userId, 'genericChange', 1, tableName, id);
  const diff = await _updateRecord(tableName, id, explId, record)
  await finishExpl(explId, {diff})
}