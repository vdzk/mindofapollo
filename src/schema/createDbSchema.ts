import { customDataTypes, pgType2valueTypeTableName } from "~/schema/dataTypes"
import { schema } from "~/schema/schema"
import { CustomDataType } from "~/schema/type"

const createEnums = () => []

const createTable = (tableName: string) => {
  const { columns, extendsTable } = schema.tables[tableName]
  let idDataType = 'serial'
  if (extendsTable) {
    idDataType = 'integer'
  } else if (columns.id) {
    idDataType = columns.id.type
  }
  const colDefs = ['id ' + idDataType + ' PRIMARY KEY']
  
  for (const colName in columns) {
    if (colName === 'id') continue
    const column = columns[colName]
    if (column.type === 'virtual') continue
    if (column.type === 'fk') {
      let fkType = schema.tables[column.fk.table].columns.id?.type ?? 'integer'
      colDefs.push(
        colName + ' ' + fkType + ' '
        + 'REFERENCES ' + column.fk.table
        + (column.fk.optional ? '' : ' NOT NULL')
      )
    } else {
      const pgType = (column.type in customDataTypes)
        ? customDataTypes[column.type as CustomDataType | "fk"]
        : column.type
      let defaultValue: string | undefined
      if (column.defaultValue === undefined) {
        defaultValue = undefined
      } else if (column.defaultValue === '') {
        defaultValue = "''"
      } else {
        defaultValue = '' + column.defaultValue
      }
      colDefs.push(
        colName + ' ' + pgType
        + (column.getVisibility ? '' : ' NOT NULL')
        + (defaultValue !== undefined ? ' DEFAULT ' + defaultValue : '')
      )
    }
  }

  return [`CREATE TABLE ${tableName} (${colDefs.join()})`]
}

const createIndexes = (tableName: string) => {
  const { columns } = schema.tables[tableName]
  const statements = [] as string[]
  for (const colName in columns) {
    if (columns[colName].type === 'fk') {
      statements.push(
        `CREATE INDEX ${tableName}_${colName}_idx ON ${tableName} (${colName})`
      )
    }
  }
  return statements
}

const createCrossTables = () => {
  const statements = [] as string[]
  for (const tableName in schema.tables) {
    const { aggregates } = schema.tables[tableName]
    if (aggregates) {
      for (const aggName in aggregates) {
        const aggregate = aggregates[aggName]
        if (aggregate.type === 'n-n' && aggregate.first) {
          const a = tableName
          const b = aggregate.table
          const xTableName = `${a}_x_${b}`

          statements.push(
            `CREATE TABLE ${xTableName} ( ${a}_id integer NOT NULL, ${b}_id integer NOT NULL)`,
            `ALTER TABLE ${xTableName} ADD CONSTRAINT ${xTableName}_un UNIQUE (${a}_id,${b}_id)`,
            `CREATE INDEX ${xTableName}_${a}_id_idx ON ${xTableName} (${a}_id)`,
            `CREATE INDEX ${xTableName}_${b}_id_idx ON ${xTableName} (${b}_id)`
          )
        }
      }
    }
  }
  return statements
}

const createValueTypeTables = () => Object.entries(pgType2valueTypeTableName)
  .map(([pgType, valueTypeTableName]) => (
    `CREATE TABLE ${valueTypeTableName} (
      id SERIAL PRIMARY KEY,
      value ${pgType}
    )`
  ))

const createDbSchema = () => {
  const statements = [] as string[]
  statements.push(...createEnums())
  for (const tableName in schema.tables) {
    statements.push(
      ...createTable(tableName),
      ...createIndexes(tableName)
    )
  }
  statements.push(...createCrossTables())
  statements.push(...createValueTypeTables())
  return statements.join(';\n')
}

console.log(createDbSchema())