import { TableSchema } from "../../schema/type";

export const tag: TableSchema = {
  plural: 'tags',
  columns: {
    name: {
      type: 'varchar'
    }
  },
  aggregates: {
    statements: {
      type: 'n-n',
      table: 'statement'
    },
    directives: {
      type: 'n-n',
      table: 'directive'
    }
  }
}
