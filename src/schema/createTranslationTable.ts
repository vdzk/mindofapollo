import { languages, langSettings } from "~/translation"
import { sqlStr } from "~/util-no-circle"

export const createTranslationTable = () => {
  // Create a column for each language in the languageNames array
  const languageColumns = languages
    .map(lang => sqlStr`${lang} text`)

  // Base SQL statements
  const statements = [
    sqlStr`CREATE TABLE translation (
      table_name text NOT NULL,
      column_name text NOT NULL, 
      record_id integer NOT NULL,
      ${languageColumns.join(',\n      ')},
      original_language text NOT NULL,
      translated boolean NOT NULL DEFAULT false,
      PRIMARY KEY (table_name, column_name, record_id)
    )`,
    sqlStr`CREATE INDEX translation_record_idx ON translation (table_name, record_id)`
  ]

  // Add full text search indexes for each language
  languages.forEach(lang => {
    const options = langSettings[lang];
    // Use specialized index type if specified, otherwise use the language directly as the text search configuration
    if (options.indexType === 'groonga') {
      statements.push(sqlStr`CREATE INDEX translation_${lang}_idx ON translation USING pgroonga (${lang})`)
    } else {
      // Use the language name directly for the PostgreSQL text search configuration
      statements.push(sqlStr`CREATE INDEX translation_${lang}_idx ON translation USING GIN (to_tsvector('${lang}', ${lang}))`)
    }
  })

  return statements
}
