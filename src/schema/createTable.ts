import featureFlags from "~/config/featureFlags"
import { translatable } from "~/utils/schema"
import { customDataTypes } from "./dataTypes"
import { schema } from "./schema"
import { CustomDataType } from "./type"

export const createTable = (tableName: string) => {
  const { columns, extendsTable, expl } = schema.tables[tableName];
  let idDataType = 'serial'
  if (extendsTable) {
    idDataType = 'integer'
  }
  const colDefs = [
    'id ' + idDataType + ' PRIMARY KEY',
  ]

  if (expl !== false) {
    colDefs.push('id_expl_id integer REFERENCES expl(id)')
  }

  // Add base column definitions
  for (const colName in columns) {
    if (colName === 'id') continue;
    const column = columns[colName];
    if (column.type === 'virtual') continue;
    // Skip translatable columns if the feature flag is enabled
    if (featureFlags.skipTranslatableColumns && translatable(tableName, colName)) continue;
    if (column.type === 'fk') {
      colDefs.push(
        colName + ' integer '
        + 'REFERENCES ' + column.fk.table
        + (column.fk.optional ? '' : ' NOT NULL')
      );
    } else {
      const pgType = (column.type in customDataTypes)
        ? customDataTypes[column.type as CustomDataType | "fk"]
        : column.type;
      let defaultValue: string | undefined;
      if (column.defaultValue === undefined) {
        defaultValue = undefined;
      } else if (column.defaultValue === '') {
        defaultValue = "''";
      } else if (['text', 'varchar'].includes(pgType)) {
        defaultValue = "'" + column.defaultValue + "'";
      } else {
        defaultValue = '' + column.defaultValue;
      }
      colDefs.push(
        colName + ' ' + pgType
        + (column.getVisibility ? '' : ' NOT NULL')
        + (column.unique ? ' UNIQUE' : '')
        + (defaultValue !== undefined ? ' DEFAULT ' + defaultValue : '')
      )
    }
  }

  // Add expl_id columns for each column only if expl is not false
  if (expl !== false) {
    for (const colName in columns) {
      if (colName !== 'id' && columns[colName].type !== 'virtual') {
        colDefs.push(`${colName}_expl_id integer REFERENCES expl(id)`)
      }
    }
  }

  return [`CREATE TABLE ${tableName} (${colDefs.join()})`]
}
