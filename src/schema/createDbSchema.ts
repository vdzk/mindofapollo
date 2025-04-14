import { createExtensions } from "./createExtensions"
import { createEnums } from "./createEnums"
import { createExplTable } from "./createExplTable"
import { createTranslationTable } from "./createTranslationTable"
import { createCrossTables } from "./createCrossTables"
import { createValueTypeTables } from "./createValueTypeTables"
import { createNotificationTables } from "./createNotificationTables"
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { format } from 'sql-formatter'
import { createPersonalDetails } from "./createPersonalDetails"
import { createTables } from "./createTables"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const schemaDir = path.join(__dirname, '..', '..', 'schema-dir')

let fileCounter = 1
export const create = (baseName: string, statements: string[]) => {
  if (statements.length > 0) {
    const filename = `${String(fileCounter).padStart(2, '0')}-${baseName}.sql`
    fs.writeFileSync(
      path.join(schemaDir, filename),
      format(statements.join(';'))
    )
    fileCounter++
    return true
  }
  return false
}

// Clear the schema-dir folder
if (fs.existsSync(schemaDir)) {
  fs.readdirSync(schemaDir).forEach(file => {
    fs.unlinkSync(path.join(schemaDir, file))
  })
} else {
  fs.mkdirSync(schemaDir, { recursive: true })
}

create('extensions', createExtensions())
create('enums', createEnums())
create('expl-table', createExplTable())
create('translation-table', createTranslationTable())
createTables()
create('personal-details', createPersonalDetails())
create('cross-tables', createCrossTables())
create('value-type-tables', createValueTypeTables())
create('notification-tables', createNotificationTables())