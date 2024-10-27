import { sql } from "~/server/db"
import { schema } from "~/schema/schema"
import { arrayToObjects } from "~/util"

const crossTables: {
  a: string,
  b: string,
  initialData?: [number, number][]
}[] = []

const customDataTypes: Record<string, string> = {
  proportion: 'numeric(6, 5)',
  link_url: 'varchar',
  link_title: 'varchar'
}

const createNewTable = async (tableName: string) => {
  const {
    columns, aggregates, extendsTable, initialData
  } = schema.tables[tableName]

  let idDataType = 'serial'
  if (extendsTable) {
    idDataType = 'integer'
  } else if (columns.id) {
    idDataType = columns.id.type
  }
  const colDefs = [`id ${idDataType} PRIMARY KEY`]

  const indexCols: string[] = []

  for (const colName in columns) {
    if (colName === 'id') continue
    const column = columns[colName]
    if (column.type === 'fk') {
      let fkType = schema.tables[column.fk.table].columns.id?.type ?? 'integer'
      colDefs.push(colName + ' ' + fkType + ' REFERENCES ' + column.fk.table + ' NOT NULL')
      indexCols.push(colName)
    } else {
      const pgType = (column.type in customDataTypes)
        ? customDataTypes[column.type]
        : column.type
      colDefs.push(colName + ' ' + pgType + ' NOT NULL')
    }
  }

  await sql.unsafe(`CREATE TABLE ${tableName} (${colDefs.join()})`)

  // Initialise data
  if (initialData) {
    const keys = Object.keys(columns)
    if (extendsTable) {
      keys.unshift('id')
    }
    const data = arrayToObjects(initialData, keys)
    await sql`INSERT INTO ${sql(tableName)} ${sql(data)}`
  }

  // Set up indexes
  for (const indexCol of indexCols) {
    await sql.unsafe(`CREATE INDEX ${tableName}_${indexCol}_idx ON ${tableName} (${indexCol})`)
  }

  // Insert into crossTables to be created later
  if (aggregates) {
    for (const aggName in aggregates) {
      const aggregate = aggregates[aggName]
      if (aggregate.type === 'n-n' && aggregate.first) {
        const a = tableName
        const b = aggregate.table
        crossTables.push({a, b, initialData: aggregate.initialData})
      }
    }
  }
}

// Create table
for (const tableName in schema.tables) {
  await createNewTable(tableName)
}
// await createNewTable('research_note')

// Create cross tables
for (const {a, b, initialData} of crossTables) {
  await sql.unsafe(`
    CREATE TABLE ${a}_x_${b} (
      ${a}_id integer NOT NULL,
      ${b}_id integer NOT NULL
    )
  `)

  if (initialData) {
    await sql.unsafe(`
      INSERT INTO ${a}_x_${b} (${a}_id, ${b}_id)
      VALUES (${initialData.map(row => row.join()).join('),(')})
    `)
  }

  await sql.unsafe(`
    ALTER TABLE ${a}_x_${b}
    ADD CONSTRAINT ${a}_x_${b}_un
    UNIQUE (${a}_id,${b}_id);
    CREATE INDEX ${a}_x_${b}_${a}_id_idx ON ${a}_x_${b} (${a}_id);
    CREATE INDEX ${a}_x_${b}_${b}_id_idx ON ${a}_x_${b} (${b}_id);
  `)
}

console.log('Done.')
