import { schema } from "./schema"

export const createCrossTables = () => {
  const statements = [] as string[]
  for (const tableName in schema.tables) {
    const { aggregates } = schema.tables[tableName]
    if (aggregates) {
      for (const aggName in aggregates) {
        const aggregate = aggregates[aggName];
        if (aggregate.type === 'n-n' && aggregate.first) {
          let a = tableName
          let b = aggregate.table
          if (a === b) {
            a = `${a}_target`
            b = `${b}_source`
          }
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
          );
        }
      }
    }
  }
  return statements
}
