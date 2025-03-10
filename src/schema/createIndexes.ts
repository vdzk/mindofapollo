import { schema } from "./schema"

export const createIndexes = (tableName: string) => {
  const { columns } = schema.tables[tableName]
  const statements = [] as string[]
  for (const colName in columns) {
    if (columns[colName].type === 'fk') {
      statements.push(
        `CREATE INDEX ${tableName}_${colName}_idx ON ${tableName} (${colName})`
      );
    }
  }
  return statements
}
