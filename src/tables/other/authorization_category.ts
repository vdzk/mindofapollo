import { TableSchema } from "~/schema/type";

export const authorization_category: TableSchema = {
  plural: 'authorization categories',
  columns: {
    name: {
      type: 'varchar'
    }
  },
  aggregates: {
    persons: {
      type: '1-n',
      table: 'person',
      column: 'authorization_category_id'
    }
  }
}