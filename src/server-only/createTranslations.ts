import { defaultLanguage} from "~/translation"
import { onError, sql } from "./db"
import { getUserLanguage } from "./session"

export const createTranslations = async (
  tableName: string,
  originalText: Record<string, string>,
  recordId: number,
  overwrite?: boolean
) => {
  const userLang = (await getUserLanguage()) ?? defaultLanguage
  const values = Object.entries(originalText).map(([colName, text]) => ({
    table_name: tableName,
    column_name: colName,
    record_id: recordId,
    original_language: userLang,
    [userLang]: text
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
}