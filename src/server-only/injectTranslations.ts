import { DataRecord } from "~/schema/type"
import { getUserLanguage } from "./session"
import { getTranslatableColumns } from "~/utils/schema"
import { onError, sql } from "./db"
import { defaultLanguage, langSettings, Language, languages } from "~/translation"
import { SourceLanguageCode, TargetLanguageCode, Translator } from "deepl-node"

const translator = new Translator(process.env.DEEPL_API_KEY!)

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
  const userLang = (await getUserLanguage()) ?? defaultLanguage

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

  // Prepare query parts
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
  const backupText = sql`COALESCE(
    ${sql.unsafe(languages.map(lang => `"${lang}"`).join(', '))}
  )`

  // Execute a single query for all translations
  const allTranslations = await sql`
    SELECT
      table_name, column_name, record_id, original_language,
      ${sql(userLang)}::text as "text",
      (to_jsonb(translation) ->> translation.original_language) AS "original_text",
      ${backupText} as backup_text
    FROM translation
    WHERE ${conditions}
  `.catch(onError)

  // Find mising translations
  const missingTr: Record<string, string[]> = {}
  const incompleteRecords: Record<string, DataRecord[]> = {}
  for (const tr of allTranslations) {
    if (tr.text === null) {
      const ogLang = tr.original_language
      if (!missingTr[ogLang]) missingTr[ogLang] = []
      if (!incompleteRecords[ogLang]) incompleteRecords[ogLang] = []
      missingTr[ogLang].push(tr.original_text)
      incompleteRecords[ogLang].push(tr)
    }
  }
  const missingLangs = Object.keys(missingTr)
  
  if (missingLangs.length > 0) {
    //Request translation
    const newTr = await Promise.all(missingLangs.map(sourceLang => {
      const { iso_639_1, regionCode } = langSettings[userLang]
      return translator.translateText(
        missingTr[sourceLang],
        langSettings[sourceLang as Language].iso_639_1 as SourceLanguageCode,
        (regionCode ?? iso_639_1) as TargetLanguageCode,
        {
          preserveFormatting: true,
          formality: 'prefer_more',
          modelType: 'prefer_quality_optimized'
        }
      ).catch(onError)
    }))

    //Fill in translations
    for (let langIndex = 0; langIndex < missingLangs.length; langIndex++) {
      const texts = newTr[langIndex]
      for (let i = 0; i < texts.length; i++) {
        incompleteRecords[missingLangs[langIndex]][i].newText = texts[i].text
      }
    }

    // Prepare values for update
    const updateValues: [string, string, number, string][] = []
    for (const lang of missingLangs) {
      const records = incompleteRecords[lang]
      for (const record of records) {
        const { table_name, column_name, record_id, newText } = record
        if (newText !== undefined) {
          updateValues.push([
            table_name as string,
            column_name as string,
            record_id as number,
            newText as string
          ])
        }
      }
    }
  
    // Save new translations (without waiting)
    sql`
      UPDATE translation t
      SET ${sql(userLang)} = v.new_text
      FROM ( VALUES ${sql(updateValues)})
        AS v(table_name, column_name, record_id, new_text)
      WHERE t.table_name = v.table_name
        AND t.column_name = v.column_name
        AND t.record_id = (v.record_id)::integer
    `.catch(onError)
  }


  // Organize translations by table_name, column_name, and record_id
  const trObj: Record<string, Record<string, Record<number, string>>> = {}
  for (const {
    table_name, column_name, record_id,
    text, newText, backup_text
  } of allTranslations) {
    if (!trObj[table_name]) trObj[table_name] = {}
    if (!trObj[table_name][column_name]) trObj[table_name][column_name] = {}
    trObj[table_name][column_name][record_id] = text ?? newText ?? backup_text
  }

  // Inject translations into records
  for (const record of records) {
    for (const tc of translatedColumns) {
      record[tc.resultColName] = trObj[tc.tableName]?.[tc.columnName]?.[record[tc.recordIdColName] as number] ?? ''
    }
  }
}

