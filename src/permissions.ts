import memoizeOne from "memoize-one";
import { schema } from "./schema/schema";
import { ColumnSchema, ForeignKey } from "./schema/type";
import { AuthRole } from "./types";

export const isPersonal = (tableName: string) => !!schema.tables[tableName].columns.owner_id
export const personalTableNames = memoizeOne(() => Object.keys(schema.tables)
  .filter(tableName => isPersonal(tableName)))
export const isPrivate = (tableName: string) => !!schema.tables[tableName].private
export const isSystem = (tableName: string) => !!schema.tables[tableName].system

export const tablesThatExtendByName = memoizeOne(() => Object.entries(schema.tables)
  .flatMap(([_, table]) => 
    Object.values(table.columns)
      .filter(column => 
        column.type === 'fk' && 
        column.fk?.extensionTables
      )
      .map(column => (column as ForeignKey).fk.table)
  )
  .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
)

const getAccessibleColNames = (
  tableName: string,
  authRole: AuthRole | undefined,
  onlyAdmin: (column: ColumnSchema, colName: string) => boolean
) => Object.entries(schema.tables[tableName].columns)
  .filter(([colName, column]) => {
    if (column.type === 'virtual') {
      return false
    } else if (onlyAdmin(column, colName)) {
      return authRole === 'admin'
    } else {
      return true
    }
  })
  .map(([colName]) => colName)

export const getWritableColNames = (tableName: string, authRole?: AuthRole) => getAccessibleColNames(
  tableName, authRole,
  (column, colName) => !!(column.readOnly || colName === 'owner_id')
)