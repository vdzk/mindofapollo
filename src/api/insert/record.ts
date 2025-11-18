import { belongsTo, getUserId, getUserActorUser } from "~/server-only/session"
import { DataRecord, DataRecordWithId } from "~/schema/type"
import { setExplRecordId, startExpl, finishExpl } from "~/server-only/expl"
import { _insertRecord } from "~/server-only/mutate"
import { ExplData, UserActor } from "~/components/expl/types"
import { needsExpl, titleColumnName } from "~/utils/schema"
import { hasCreator, hasOwner, tablesThatExtendByName } from "~/permissions"
import { _getRecordById } from "~/server-only/select"
import { insertCrossRecords } from "~/server-only/insertCrossRecords"
import { schema } from "~/schema/schema"
import { allowedTableContent } from "~/server-only/moderate"

export const whoCanInsertRecord = (tableName: string) => {
  if (
    tableName === 'person'
    || tablesThatExtendByName().includes(tableName)
    || tableName === 'statement_type'
  ) {
    return []
  } else {
    return ['invited']
  }
}

export const injectUserId = (record: DataRecord, userId: number, tableName: string) => {
  if (hasOwner(tableName)) {
    record.owner_id = userId
  }
  if (hasCreator(tableName)) {
    record.creator_id = userId
  }
}

export const insertRecord = async (
  tableName: string,
  record: DataRecord,
  linkedCrossRefs?: Record<string, number[]>
) => {
  "use server"
  if (! await belongsTo(whoCanInsertRecord(tableName))) return
  if (! await allowedTableContent(tableName, record)) {
    throw new Error('You content didn\'t pass the filter.')
  }
  const userId = await getUserId()

  injectUserId(record, userId, tableName)
  const explId = needsExpl(tableName)
    ? await startExpl(userId, 'insertRecord', 1, tableName, null)
    : null
  const result = await _insertRecord(tableName, record, explId)
  const savedRecord = await _getRecordById(tableName, result.id)
  if (!savedRecord || !explId) return
  await setExplRecordId(explId, savedRecord.id)

  const titleColName = titleColumnName(tableName)
  const titleColumn = schema.tables[tableName].columns[titleColName]
  let targetLabel: string
  if (titleColumn.type === 'fk') {
    const titleRecord = await _getRecordById(
      titleColumn.fk.table,
      savedRecord[titleColName] as number,
      [titleColumn.fk.labelColumn]
    )
    targetLabel = titleRecord[titleColumn.fk.labelColumn] as string
  } else {
    targetLabel = savedRecord[titleColName] as string
  }

  const user = await getUserActorUser()
  const data: InsertRecordData = {
    tableName,
    record: savedRecord,
    user,
    targetLabel
  }
  await finishExpl(explId, data)
  if (linkedCrossRefs) {
    insertCrossRecords(
      tableName,
      savedRecord.id,
      linkedCrossRefs,
      { explId, label: 'created new record' }
    )
  }
  return savedRecord
}

export interface InsertRecordData {
  tableName: string
  record: DataRecordWithId
  user: UserActor['user']
  targetLabel: string
}

export const explInsertRecord = (data: InsertRecordData): ExplData => ({
  actor: { type: 'user', user: data.user },
  action: 'created',
  target: {
    tableName: data.tableName,
    id: data.record.id,
    label: data.targetLabel
  },
  insertedRecords: {
    [data.tableName]: [data.record]
  }
})