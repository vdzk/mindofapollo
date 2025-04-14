import memoizeOne from "memoize-one";
import { schema } from "./schema";
import { CustomDataType } from "./type";
import { proportionDecimals, proportionPrecision } from "~/util-no-circle";

export const customDataTypes: Record<CustomDataType | 'fk', string> = {
  fk: 'integer',
  proportion: `numeric(${proportionPrecision}, ${proportionDecimals})`,
  weight: 'numeric(9, 2)',
  link_url: 'varchar',
  link_title: 'varchar',
  option: 'varchar',
  value_type_id: 'integer',
  table_name: 'varchar',
  column_name: 'varchar',
}

export const sanitizeTableName = (str: string) => str
  .trim()
  .replace(/^[^a-zA-Z_]/, '_')    // Ensure starts with a letter or underscore
  .replace(/[^a-zA-Z0-9_]/g, '_') // Replace invalid characters with underscores
  .replace(/_+/g, '_')            // Collapse multiple underscores into one
  .replace(/^_+|_+$/g, '')        // Trim leading and trailing underscores
  .substring(0, 63);              // Truncate to 63 characters

export const getPgTypeDictionaries = memoizeOne(() => {
  const colType2pgType: Record<string, string> = {}
  const pgType2valueTypeTableName: Record<string, string> = {}
  for (const tableName in schema.tables) {
    const table = schema.tables[tableName]
    for (const colName in table.columns) {
      const column = table.columns[colName]
      if (!(column.type in colType2pgType) && column.type !== 'virtual') {
        const pgType = (column.type in customDataTypes)
          ? customDataTypes[column.type as CustomDataType | 'fk']
          : column.type

        colType2pgType[column.type] = pgType
        if (!(pgType in pgType2valueTypeTableName)) {
          pgType2valueTypeTableName[pgType] = 'value_type_'
            + sanitizeTableName(pgType)
        }
      }
    }
  }
  return { colType2pgType, pgType2valueTypeTableName }
})

export const getValueTypeTableNameByColType = (colType: string) => {
  const { colType2pgType, pgType2valueTypeTableName } = getPgTypeDictionaries()
  return pgType2valueTypeTableName[colType2pgType[colType]]
}

export const getValueTypeTableName = (tableName: string, colName: string) =>
  getValueTypeTableNameByColType(schema.tables[tableName].columns[colName].type)