import { TableSchema } from "../../schema/type";

export const person_category: TableSchema = {
  plural: 'person categories',
  columns: {
    name: {
      type: 'varchar'
    }
  },
  aggregates: {
    persons: {
      type: 'n-n',
      table: 'person'
    }
  }
}