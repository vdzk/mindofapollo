import memoizeOne from "memoize-one";
import { schema } from "./schema/schema";
import { ColumnSchema, DataRecord, ForeignKey } from "./schema/type";
import { AuthRole } from "./types";

export const hasOwner = (tableName: string) => !!schema.tables[tableName].columns.owner_id
export const hasCreator = (tableName: string) => !!schema.tables[tableName].columns.creator_id
export const personalTableNames = memoizeOne(() => Object.keys(schema.tables)
  .filter(tableName => hasOwner(tableName)))
export const isPrivate = (tableName: string) => !!schema.tables[tableName].private
export const isSystem = (tableName: string) => !!schema.tables[tableName].system

// This function is used to avoid creating new records that should have a corresponding table with the same name
export const tablesThatExtendByName = memoizeOne(() => Object.entries(schema.tables)
  .flatMap(([_, table]) => 
    Object.values(table.columns)
      .filter(column => 
        column.type === 'fk' && 
        column.fk?.extensionTables &&
        !column.fk?.extensionColumn
      )
      .map(column => (column as ForeignKey).fk.table)
  )
  .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
)

export const getWritableColNames = (
  tableName: string,
  recordData: { newRecord: true } | { record: DataRecord },
  authRole?: AuthRole,
) => {
  const writableColNames: string[] = []
  const columns = schema.tables[tableName].columns
  for (const colName in columns) {
    const column = columns[colName]
    if (column.type === 'virtual') continue
    if (authRole !== 'admin') {
      if (['owner_id', 'creator_id'].includes(colName)) continue
      if (column.readOnly) continue
      if (column.canEditCondition && !('newRecord' in recordData)) {
        const c = column.canEditCondition
        if (recordData.record[c.colName] !== c.value) continue
      }
    }
    writableColNames.push(colName)
  }

  return writableColNames
}