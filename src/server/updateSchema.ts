import { sql } from "~/server/db"
import { schema } from "~/schema"

const crossTables: Record<string, [string, string]> = {}

const createNewTable = async (newTableName: string) => {
  const colDefs = ['id SERIAL PRIMARY KEY']

  const { columns, aggregates } = schema.tables[newTableName]
  const indexCols: string[] = []
  
  for (const colName in columns) {
    const column = columns[colName]
    if (column.type === 'fk') {
      colDefs.push(colName + ' integer REFERENCES ' + column.fk.table + ' NOT NULL')
      indexCols.push(colName) 
    } else {
      colDefs.push(colName + ' ' + column.type + ' NOT NULL')
    } 
  }
  
  await sql.unsafe(`CREATE TABLE ${newTableName} (${colDefs.join()})`)
  
  for (const indexCol of indexCols) {
    await sql.unsafe(`CREATE INDEX ${newTableName}_${indexCol}_idx ON ${newTableName} (${indexCol})`)
  }

  // Insert into crossTables to be created later 
  if (aggregates) {
    for (const aggName in aggregates) {
      const aggregate = aggregates[aggName]
      if (aggregate.type === 'n-n' && aggregate.first) {
        const tablePair: [string, string] = [newTableName, aggregate.table]
        crossTables[tablePair.join()] = tablePair
      }
    }
  }
}

// Create table
// for (const tableName in schema.tables) {
//   await createNewTable(tableName)
// }
await createNewTable('critical_statement')

// Create cross tables
for (const [a, b] of Object.values(crossTables)) {
  await sql`
    CREATE TABLE ${a}_x_${b} (
      ${a}_id integer NOT NULL,
      ${b}_id integer NOT NULL
    );
    ALTER TABLE ${a}_x_${b}
    ADD CONSTRAINT ${a}_x_${b}_un
    UNIQUE (${a}_id,${b}_id);
    CREATE INDEX ${a}_x_${b}_${a}_id_idx ON ${a}_x_${b} (${a}_id);
    CREATE INDEX ${a}_x_${b}_${b}_id_idx ON ${a}_x_${b} (${b}_id);
  `.simple()
}

console.log('Done.')
