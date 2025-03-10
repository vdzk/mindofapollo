import { schema } from "~/schema/schema"
import { createExtensions } from "./createExtensions"
import { createEnums } from "./createEnums"
import { createExplTable } from "./createExplTable"
import { createTranslationTable } from "./createTranslationTable"
import { createTable } from "./createTable"
import { createIndexes } from "./createIndexes"
import { createCrossTables } from "./createCrossTables"
import { createValueTypeTables } from "./createValueTypeTables"
import { createNotificationTables } from "./createNotificationTables"

const createDbSchema = () => {
  const statements = [] as string[]
  statements.push(...createExtensions())
  statements.push(...createEnums())
  statements.push(...createExplTable())
  statements.push(...createTranslationTable())
  for (const tableName in schema.tables) {
    statements.push(
      ...createTable(tableName),
      ...createIndexes(tableName)
    )
  }
  statements.push(...createCrossTables())
  statements.push(...createValueTypeTables())
  statements.push(...createNotificationTables())
  return statements.join(';\n')
}

console.log(createDbSchema())