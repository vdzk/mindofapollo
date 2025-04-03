import { defaultLanguage, langSettings, languages } from "~/translation"
import { onError, sql } from "./db"
import { getUserLanguage } from "./session"
import { SourceLanguageCode, TargetLanguageCode, Translator } from 'deepl-node'
import dotenv from "dotenv"
import { humanCase } from "~/utils/string"

dotenv.config()
const translator = new Translator(process.env.DEEPL_API_KEY!)

export const createTranslations = async (
  tableName: string,
  originalText: Record<string, string>,
  recordId: number,
  overwrite?: boolean
) => {
  const language = (await getUserLanguage()) ?? defaultLanguage
  const values = Object.entries(originalText).map(([colName, text]) => ({
    table_name: tableName,
    column_name: colName,
    record_id: recordId,
    original_language: language,
    [language]: text
  }))
  const colNames = Object.keys(originalText)
  if (overwrite) {
    await sql`
      DELETE FROM translation
      WHERE table_name = ${tableName}
        AND column_name IN ${sql(colNames)}
        AND record_id = ${recordId}
    `.catch(onError)
  }
  await sql`INSERT INTO translation ${sql(values)}`.catch(onError)

  // Make one request per target language
  // Don't wait for translations to finish
  const targetLanguages = languages.filter(lang => lang !== language)
  Promise.all(targetLanguages.map(targetLang => {
    const { iso_639_1, regionCode } = langSettings[targetLang]
    const sourceTexts = Object.values(originalText).map(text => text ? text : '--')
    return translator.translateText(
      sourceTexts,
      langSettings[language].iso_639_1 as SourceLanguageCode,
      (regionCode ?? iso_639_1) as TargetLanguageCode,
      {
        preserveFormatting: true,
        formality: 'prefer_more',
        context: `${humanCase(tableName)} ${colNames.map(humanCase)}`,
        modelType: 'prefer_quality_optimized'
      }
    )
  })).then(async (translations) => {
    // Make one DB update per column
    Promise.all(colNames.map(async (colName, i) => {
      const values = Object.fromEntries(targetLanguages.map(
        (lang, j) => [lang, translations[j][i].text]
      ))
      await sql`
        UPDATE translation
        SET ${sql(values)}
        WHERE table_name = ${tableName}
          AND column_name = ${colName}
          AND record_id = ${recordId}
      `.catch(onError)
    }))
  }).catch(onError)
}