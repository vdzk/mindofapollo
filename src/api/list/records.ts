import { hasOwner } from "~/permissions"
import { DataRecordWithId } from "~/schema/type"
import { onError, sql } from "~/server-only/db"
import { _getRecordsByIds, injectVirtualValues } from "~/server-only/select"
import { getUserId } from "~/server-only/session"
import { injectTranslations } from "~/server-only/injectTranslations"
import { schema } from "../../schema/schema"
import { getExtTableName } from "~/utils/schema"
import { indexBy } from "~/utils/shape"

export const listRecords = async (
  tableName: string,
  extendTable?: boolean
) => {
  "use server"
  let filterClause
  let selectClause = sql`t.*`
  const table = schema.tables[tableName]
  if (hasOwner(tableName) && (table.private ?? true)) {
    const userId = await getUserId()
    if (!userId) return []
    filterClause = sql`WHERE owner_id = ${await getUserId()}`
  } else {
    filterClause = sql``
  }  
  const records = await sql`
    SELECT ${selectClause}
    FROM ${sql(tableName)} t
    ${filterClause}
    ORDER BY t.id
  `.catch(onError)
  await injectTranslations(tableName, records)
  await injectVirtualValues(tableName, records)

  if (extendTable) {
    const extTableIds: Record<string, number[]> = {}
    for (const record of records) {
      const extTableName = getExtTableName(tableName, record, !!table.optionallyExtendedByTable)
      if (!extTableName) continue
      if (!extTableIds[extTableName]) {
        extTableIds[extTableName] = []
      }
      extTableIds[extTableName].push(record.id)
    }
    const extRecords = (await Promise.all(Object.entries(extTableIds).map(
      async ([extTableName, extIds]) => {
        const extRecords = await _getRecordsByIds(extTableName, 'id', extIds)
        for (const extRecord of extRecords) {
          extRecord.extTableName = extTableName
        }
        return extRecords
      }
    ))).flat()
    const extRecordsById = indexBy(extRecords, 'id')
    for (const record of records) {
      const extRecord = extRecordsById[record.id]
      if (extRecord) {
        Object.assign(record, extRecord)
      }
    }
  }

  return records as unknown as DataRecordWithId[]
}