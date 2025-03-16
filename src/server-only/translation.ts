import { DataRecord } from "~/schema/type"
import { getUserLanguage } from "./session"
import { getTranslatableColumns } from "~/utils/schema"
import { onError, sql } from "./db"
import { languages } from "~/translation"

export interface TranslatedColumn {
  tableName: string
  columnName: string
  recordIdColName: string
  resultColName: string
}

export const injectTranslations = async (
  tableName: string | null,
  records?: DataRecord[],
  colNames?: string[] | null,
  translatedColumns: TranslatedColumn[] = [],
  mainIdColName = 'id'
) => {
  if (!records || records.length === 0) return
  const language = await getUserLanguage()

  // Get main translaed columns
  if (tableName) {
    for (const colName of getTranslatableColumns(tableName, colNames)) {
      translatedColumns.push({
        tableName,
        columnName: colName,
        recordIdColName: mainIdColName,
        resultColName: colName
      })
    }
  }

  let conditions = sql`${false}`
  for (const tc of translatedColumns) {
    const recordIds = records
      .map(record => record[tc.recordIdColName] as number)
      .filter(id => id)
    if (recordIds.length === 0) continue
    conditions = sql`${conditions} OR (
      table_name = ${tc.tableName}
      AND column_name = ${tc.columnName}
      AND record_id IN ${sql(recordIds)}
    )`
  }

  const backupLangs = languages.filter(lang => lang !== language)
  const coalesceLanguages = sql`COALESCE(
    ${sql(language)},
    ${sql.unsafe(backupLangs.map(lang => `"${lang}"`).join(', '))}
  )`

  // Execute a single query for all translations
  const allTranslations = await sql`
    SELECT
      table_name, column_name, record_id,
      ${coalesceLanguages} as text
    FROM translation
    WHERE ${conditions}
  `.catch(onError)
  console.log('translatedColumns', translatedColumns)
  console.log('allTranslations', allTranslations)

  // Organize translations by table_name, column_name, and record_id
  const trObj: Record<string, Record<string, Record<number, string>>> = {}
  for (const { table_name, column_name, record_id, text } of allTranslations) {
    if (!trObj[table_name]) trObj[table_name] = {}
    if (!trObj[table_name][column_name]) trObj[table_name][column_name] = {}
    trObj[table_name][column_name][record_id] = text
  }

  // Inject translations into records
  for (const record of records) {
    for (const tc of translatedColumns) {
      record[tc.resultColName] = trObj[tc.tableName]?.[tc.columnName]?.[record[tc.recordIdColName] as number] ?? ''
    }
  }
}

