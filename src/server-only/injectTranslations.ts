import { DataRecord } from "~/schema/type"
import { getUserLanguage } from "./session"
import { getTranslatableColumns } from "~/utils/schema"
import { onError, sql } from "./db"
import { defaultLanguage, langSettings, Language, languages } from "~/translation"
import { SourceLanguageCode, TargetLanguageCode, Translator } from "deepl-node"

const mockTranslator = {
  translateText: async (
    texts: string | string[],
    _sourceLang: SourceLanguageCode,
    targetLang: TargetLanguageCode,
    _options?: any
  ) => {
    const textsArray = Array.isArray(texts) ? texts : [texts]
    const targetCode = targetLang.toLowerCase().split('-')[0]
    return textsArray.map(text => ({
      text: `${targetCode}: ${text}`
    }))
  }
}

// TODO: warn if translation API key is not set
const translator = process.env.DEEPL_API_KEY 
  ? new Translator(process.env.DEEPL_API_KEY)
  : mockTranslator

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
    const newTr = await Promise.all(missingLangs.map(async (sourceLang) => {
      const { iso_639_1, regionCode } = langSettings[userLang]
      
      // Filter out empty strings and keep track of indices
      const textsToTranslate: string[] = []
      const indexMap: number[] = []
      missingTr[sourceLang].forEach((text, index) => {
        if (text && text.trim() !== '') {
          textsToTranslate.push(text)
          indexMap.push(index)
        }
      })
      
      // If no valid texts to translate, return empty array
      if (textsToTranslate.length === 0) {
        return { translations: [], indexMap: [] }
      }
      
      const translations = await translator.translateText(
        textsToTranslate,
        langSettings[sourceLang as Language].iso_639_1 as SourceLanguageCode,
        (regionCode ?? iso_639_1) as TargetLanguageCode,
        {
          preserveFormatting: true,
          formality: 'prefer_more',
          modelType: 'prefer_quality_optimized'
        }
      ).catch(onError)
      
      return { translations, indexMap }
    }))

    //Fill in translations
    for (let langIndex = 0; langIndex < missingLangs.length; langIndex++) {
      const { translations, indexMap } = newTr[langIndex]
      for (let i = 0; i < translations.length; i++) {
        const originalIndex = indexMap[i]
        incompleteRecords[missingLangs[langIndex]][originalIndex].newText = translations[i].text
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
  
    // Save new translations (without waiting) - only if there are values to update
    if (updateValues.length > 0) {
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

