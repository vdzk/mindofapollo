import { TableSchema } from "~/schema/type"

export const person_secret: TableSchema = {
  plural: 'person secrets',
  extendsTable: 'person',
  private: true,
  columns: {
    email: {
      type: 'varchar'
    },
    password: {
      type: 'varchar'
    },
    owner_id: {
      type: 'fk',
      fk: {
        table: 'person',
        labelColumn: 'name'
      }
    },
  }
}