import { TableSchema } from "../../schema/type";

export const tag: TableSchema = {
  plural: 'tags',
  columns: {
    name: {
      type: 'varchar'
    },
    description: {
      type: 'text'
    }
  },
  aggregates: {
    statements: {
      type: 'n-n',
      table: 'statement'
    }
  }
}
