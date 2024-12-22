import { customDataTypes, pgType2valueTypeTableName } from "~/schema/dataTypes"
import { schema } from "~/schema/schema"
import { CustomDataType } from "~/schema/type"

const historyColDefs = [
  'data_op data_op NOT NULL',
  'op_user_id integer NOT NULL',
  'op_timestamp timestamp default current_timestamp'
]

const createEnums = () => ["CREATE TYPE data_op AS ENUM ('INSERT', 'UPDATE', 'DELETE')"]

const createTable = (tableName: string, options?: { history?: boolean}) => {
  const { columns, extendsTable } = schema.tables[tableName]
  const history = !!options?.history

  let idDataType = history ? 'integer' : 'serial'
  if (extendsTable) {
    idDataType = 'integer'
  } else if (columns.id) {
    idDataType = columns.id.type
  }
  const colDefs = ['id ' + idDataType + ' ' + (history ? 'NOT NULL' : 'PRIMARY KEY')]

  for (const colName in columns) {
    if (colName === 'id') continue
    const column = columns[colName]
    if (column.type === 'fk') {
      let fkType = schema.tables[column.fk.table].columns.id?.type ?? 'integer'
      colDefs.push(
        colName + ' ' + fkType + ' '
        + (history ? '' : ('REFERENCES ' + column.fk.table))
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

  if (history) {
    colDefs.push(...historyColDefs)
  }

  return [`CREATE TABLE ${tableName}${history ? '_h' : ''} (${colDefs.join()})`]
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

  // History table indexes
  statements.push(
    `CREATE INDEX ${tableName}_h_id_idx ON ${tableName}_h (id)`,
    `CREATE INDEX ${tableName}_h_op_user_id_idx ON ${tableName}_h (op_user_id)`
  )
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

          // Create cross reference and history tables
          for (const history of [true, false]) {
            statements.push(
              `CREATE TABLE ${xTableName + (history ? '_h' : '')} ( ${a}_id integer NOT NULL, ${b}_id integer NOT NULL ${history ? ',' + historyColDefs.join() : ''})`
            )
          }

          // Create indexes and constraints
          statements.push(
            `ALTER TABLE ${xTableName} ADD CONSTRAINT ${xTableName}_un UNIQUE (${a}_id,${b}_id)`,
            `CREATE INDEX ${xTableName}_${a}_id_idx ON ${xTableName} (${a}_id)`,
            `CREATE INDEX ${xTableName}_${b}_id_idx ON ${xTableName} (${b}_id)`
          )
          
          statements.push(
            `CREATE INDEX ${xTableName}_h_op_user_id_idx ON ${xTableName}_h (op_user_id)`
          )
        }
      }
    }
  }
  return statements
}

const createValueTypeTables = () => Object.entries(pgType2valueTypeTableName)
  .map(([pgType, valueTypeTableName]) => (
    `CREATE TABLE ${valueTypeTableName}
    ( id SERIAL PRIMARY KEY, value ${pgType})`
  ))

const createDbSchema = () => {
  const statements = [] as string[]
  statements.push(...createEnums())
  for (const tableName in schema.tables) {
    statements.push(
      ...createTable(tableName),
      ...createTable(tableName, { history: true }),
      ...createIndexes(tableName)
    )
  }
  statements.push(...createCrossTables())
  statements.push(...createValueTypeTables())
  return statements.join(';\n')
}

console.log(createDbSchema())