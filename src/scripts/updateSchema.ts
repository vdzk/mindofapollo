import { sql } from "~/server/db"
import { schema } from "~/schema"

const createNewTable = async (newTableName: string) => {
  const colDefs = ['id SERIAL PRIMARY KEY']

  const { columns } = schema.tables[newTableName]
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
}

for (const tableName in schema.tables) {
  await createNewTable(tableName)
}
