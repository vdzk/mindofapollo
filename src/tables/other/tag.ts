import { TableSchema } from "../../schema/type";

export const tag: TableSchema = {
  plural: 'tags',
  columns: {
    name: {
      type: 'varchar'
    },
    description: {
      type: 'text',
      defaultValue: ''
    }
  },
  aggregates: {
    statements: {
      type: 'n-n',
      table: 'statement'
    }
  }
}
