import { customDataTypes, pgType2valueTypeTableName } from "~/schema/dataTypes"
import { schema } from "~/schema/schema"
import { CustomDataType } from "~/schema/type"

const createEnums = () => []

const createExplTable = () => [
  `CREATE TABLE expl (
    id serial PRIMARY KEY,
    user_id integer,
    action text NOT NULL,
    version integer NOT NULL,
    table_name text,
    record_id integer,
    data jsonb,
    timestamp timestamptz NOT NULL
  )`
]

const createTable = (tableName: string) => {
  const { columns, extendsTable } = schema.tables[tableName]
  let idDataType = 'serial'
  if (extendsTable) {
    idDataType = 'integer'
  }
  const colDefs = [
    'id ' + idDataType + ' PRIMARY KEY',
    'id_expl_id integer REFERENCES expl(id)'
  ]
  
  // Add base column definitions
  for (const colName in columns) {
    if (colName === 'id') continue
    const column = columns[colName]
    if (column.type === 'virtual') continue
    if (column.type === 'fk') {
      colDefs.push(
        colName + ' integer '
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
        + (column.unique ? ' UNIQUE' : '')
        + (defaultValue !== undefined ? ' DEFAULT ' + defaultValue : '')
      )
    }
  }

  // Add expl_id columns for each column
  for (const colName in columns) {
    if (colName !== 'id' && columns[colName].type !== 'virtual') {
      colDefs.push(`${colName}_expl_id integer REFERENCES expl(id)`)
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
            `CREATE TABLE ${xTableName} (
              ${a}_id integer NOT NULL,
              ${b}_id integer NOT NULL,
              ${a}_id_expl_id integer REFERENCES expl(id),
              ${b}_id_expl_id integer REFERENCES expl(id)
            )`,
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
      id_expl_id integer REFERENCES expl(id),
      value ${pgType},
      value_expl_id integer REFERENCES expl(id)
    )`
  ))

const createDbSchema = () => {
  const statements = [] as string[]
  statements.push(...createEnums())
  statements.push(...createExplTable())
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