import { adminUserId } from "~/constant"
import { schema } from "./schema"
import { defaultLanguage, languages } from "~/translation"
import { hashPassword } from "~/server-only/crypt"
import { onError, sql } from "~/server-only/db"
import { translatable } from "~/utils/schema"
import { DataLiteral, DataRecord } from "./type"
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from "url"

const seed: Record<string, DataRecord[]> = {}
const translateTables = []

// Add seed tables
for (const tableName in schema.tables) {
  const table = schema.tables[tableName]
  if (table.seed) {
    translateTables.push(tableName)
    const nonTranslatableColNames = Object.keys(table.columns)
      .filter(colName => !translatable(tableName, colName))
    seed[tableName] = await sql`
      SELECT ${sql(['id', ...nonTranslatableColNames])}
      FROM ${sql(tableName)}
      ORDER BY id
    `.catch(onError)
  }
}
seed.translation = await sql`
  SELECT
    table_name, column_name, record_id,
    ${sql(defaultLanguage)}, ${defaultLanguage} AS original_language
  FROM translation
  WHERE table_name IN ${sql(translateTables)}
`.catch(onError)

// Add Admin user
seed.person = [{
  id: adminUserId,
  auth_role_id: 1,
  language: defaultLanguage
}]
seed.translation.push({
  table_name: 'person',
  column_name: 'name',
  record_id: adminUserId,
  [defaultLanguage]: 'admin',
  original_language: defaultLanguage
})
seed.personal_details = [{
  user_id: adminUserId,
  email: 'admin',
  password_hash: hashPassword('admin')
}]

const toSqlValue = (v: DataLiteral) => {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE'
  if (typeof v === 'number') return String(v)
  // handle string value
  const escaped = v
    .replace(/\\/g, '\\\\')  // escape backslashes
    .replace(/'/g, "''")     // escape single quotes
  return `'${escaped}'`
}

const buildInsert = (table: string, rows: DataRecord[]) => {
  const colNames = Object.keys(rows[0])
  const colList = colNames.join(', ')

  const values = rows.map(row => {
    const rowVals = colNames.map(colName => toSqlValue(row[colName]))
    return `(${rowVals.join(', ')})`
  }).join(',\n  ')

  return `INSERT INTO ${table} (${colList}) VALUES\n  ${values};`
}

const buildSql = (seedObj: Record<string, DataRecord[]>) => {
  const chunks = ['-- Generated seed inserts', 'BEGIN;']
  for (const [table, rows] of Object.entries(seedObj)) {
    const stmt = buildInsert(table, rows)
    if (stmt) chunks.push(stmt)
  }
  chunks.push('COMMIT;')
  return chunks.join('\n\n')
}

const sqlOutput = buildSql(seed)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectDir = path.join(__dirname, '..', '..')
fs.writeFileSync(path.join(projectDir, 'seed.sql'), sqlOutput, 'utf8')
await sql.end()