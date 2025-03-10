import { pgType2valueTypeTableName } from "./dataTypes"

export const createValueTypeTables = () => Object.entries(pgType2valueTypeTableName)
  .map(([pgType, valueTypeTableName]) => (
    `CREATE TABLE ${valueTypeTableName} (
      id SERIAL PRIMARY KEY,
      id_expl_id integer REFERENCES expl(id),
      value ${pgType},
      value_expl_id integer REFERENCES expl(id)
    )`
  ))
