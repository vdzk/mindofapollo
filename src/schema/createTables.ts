import { schema } from "~/schema/schema"
import { createTable } from "./createTable"
import { createIndexes } from "./createIndexes"
import { create } from "./createDbSchema"

const canCreateTable = (tableName: string, isTableCreated: Set<string>): boolean => {
  const table = schema.tables[tableName]
  if (table.extendsTable && !isTableCreated.has(table.extendsTable)) {
    return false
  }
  return !Object.values(table.columns)
    .some(column => column.type === 'fk' && !isTableCreated.has(column.fk.table))
}

export const createTables = (): void => {
  const isTableCreated = new Set<string>()
  const pendingTables = new Set(Object.keys(schema.tables))
  let lastPendingSize = -1

  while (pendingTables.size > 0 && pendingTables.size !== lastPendingSize) {
    lastPendingSize = pendingTables.size
    
    for (const tableName of pendingTables) {
      if (canCreateTable(tableName, isTableCreated)) {
        create(
          `table-${tableName}`, 
          [...createTable(tableName), ...createIndexes(tableName)]
        )
        isTableCreated.add(tableName)
        pendingTables.delete(tableName)
      }
    }
  }

  if (pendingTables.size > 0) {
    throw new Error(`Circular dependency detected in tables: ${Array.from(pendingTables)}`)
  }
}
