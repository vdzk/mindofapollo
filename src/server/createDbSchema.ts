import { sql } from "~/server/db"
import { insertRecordServerOnly } from "./serverOnly"
import { schema } from "~/schema/schema"
import { arrayToObjects } from "~/util"
import { insertCrossRecordServerOnly } from "./serverOnly"

const customDataTypes: Record<string, string> = {
  proportion: 'numeric(6, 5)',
  link_url: 'varchar',
  link_title: 'varchar'
}

const userId = 1

const historyColDefs = [
  'data_op data_op NOT NULL',
  'op_user_id integer NOT NULL',
  'op_timestamp timestamp default current_timestamp'
]

const wipeSchema = async () => {
  await sql.unsafe(`
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
    GRANT ALL ON SCHEMA public TO postgres;
    GRANT ALL ON SCHEMA public TO public;
    COMMENT ON SCHEMA public IS 'standard public schema';
  `)
}

const createEnums = async () => {
  await sql.unsafe("CREATE TYPE data_op AS ENUM ('INSERT', 'UPDATE', 'DELETE')");
}

const createTable = async (tableName: string, options?: { history?: boolean}) => {
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
        + ' NOT NULL'
      )
    } else {
      const pgType = (column.type in customDataTypes)
        ? customDataTypes[column.type]
        : column.type
      colDefs.push(colName + ' ' + pgType + (column.getVisibility ? '' : ' NOT NULL'))
    }
  }

  if (history) {
    colDefs.push(...historyColDefs)
  }

  await sql.unsafe(`CREATE TABLE ${tableName}${history ? '_h' : ''} (${colDefs.join()})`)
}

const initialiseData = async (tableName: string) => { 
  const { columns, extendsTable, initialData } = schema.tables[tableName]
  if (initialData) {
    const keys = Object.keys(columns)
    if (extendsTable) {
      keys.unshift('id')
    }
    const data = arrayToObjects(initialData, keys)
    for (const record of data) {
      // This should populate history tables as well
      await insertRecordServerOnly(userId, tableName, record)
    }
  }
}

const createIndexes = async (tableName: string) => {
  const { columns } = schema.tables[tableName]

  for (const colName in columns) {
    if (columns[colName].type === 'fk') {
      await sql.unsafe(`CREATE INDEX ${tableName}_${colName}_idx ON ${tableName} (${colName})`)
    }
  }

  // History table indexes
  await sql.unsafe(`
    CREATE INDEX ${tableName}_h_id_idx ON ${tableName}_h (id);
    CREATE INDEX ${tableName}_h_op_user_id_idx ON ${tableName}_h (op_user_id);
  `)
}

const createCrossTables = async () => {
  for (const tableName in schema.tables) {
    const { aggregates } = schema.tables[tableName]
    if (aggregates) {
      for (const aggName in aggregates) {
        const aggregate = aggregates[aggName]
        if (aggregate.type === 'n-n' && aggregate.first) {
          const a = tableName
          const b = aggregate.table
          const data = aggregate.initialData
          const xTableName = `${a}_x_${b}`

          // Create cross reference and history tables
          for (const history of [true, false]) {
            await sql.unsafe(`
              CREATE TABLE ${xTableName + (history ? '_h' : '')} (
                ${a}_id integer NOT NULL,
                ${b}_id integer NOT NULL
                ${history ? ',' + historyColDefs.join() : ''}
              )
            `)
          }

          // Initialise data
          if (data) {
            for (const [a_id, b_id] of data) {
              // This should populate history records as well
              await insertCrossRecordServerOnly(userId, {a, b, first: true, a_id, b_id})
            }
          }

          // Create indexes and constraints
          await sql.unsafe(`
            ALTER TABLE ${xTableName}
            ADD CONSTRAINT ${xTableName}_un
            UNIQUE (${a}_id,${b}_id);
            CREATE INDEX ${xTableName}_${a}_id_idx ON ${xTableName} (${a}_id);
            CREATE INDEX ${xTableName}_${b}_id_idx ON ${xTableName} (${b}_id);
          `)
          
          await sql.unsafe(
            `CREATE INDEX ${xTableName}_h_op_user_id_idx `
            + `ON ${xTableName}_h (op_user_id)`
          )
        }
      }
    }
  }
}

const createDbSchema = async () => {
  process.env.userId = '1'
  await createEnums()
  for (const tableName in schema.tables) {
    await createTable(tableName)
    await createTable(tableName, { history: true })
    await initialiseData(tableName)
    await createIndexes(tableName)
  }
  await createCrossTables()
}

await wipeSchema()
await createDbSchema()
console.log('Done.')