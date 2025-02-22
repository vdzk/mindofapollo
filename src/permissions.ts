import { schema } from "./schema/schema";
import { ColumnSchema } from "./schema/type";
import { AuthRole } from "./types";

export const isPersonal = (tableName: string) => !!schema.tables[tableName].columns.owner_id
export const isPrivate = (tableName: string) => !!schema.tables[tableName].private

const getAccessibleColNames = (
  tableName: string,
  authRole: AuthRole | undefined,
  onlyAdmin: (column: ColumnSchema) => boolean
) => Object.entries(schema.tables[tableName].columns)
  .filter(([colName, column]) => {
    if (column.type === 'virtual') {
      return false
    } else if (onlyAdmin(column)) {
      return authRole === 'admin'
    } else {
      return true
    }
  })
  .map(([colName]) => colName)

export const getReadableColNames = (tableName: string, authRole?: AuthRole) => getAccessibleColNames(
  tableName,
  authRole,
  column => !!column.private
)

export const getWritableColNames = (tableName: string, authRole?: AuthRole) => getAccessibleColNames(
  tableName,
  authRole,
  column => !!(column.private || column.readOnly)
)