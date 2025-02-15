import { TableSchema } from "~/schema/type";

export const person: TableSchema = {
  plural: 'persons',
  columns: {
    name: {
      type: 'varchar'
    },
    email: {
      type: 'varchar'
    },
    password: {
      type: 'varchar'
    },
    authorization_category_id: {
      type: 'fk',
      fk: {
        table: 'authorization_category',
        labelColumn: 'name'
      }
    } 
  },
  aggregates: {
    person_categories: {
      type: 'n-n',
      table: 'person_category',
      first: true
    },
    moral_weights: {
      type: '1-n',
      table: 'moral_weight',
      column: 'person_id'
    }
  }
}
