import { TableSchema } from "../../schema/type";

export const tag: TableSchema = {
  plural: 'tags',
  columns: {
    name: {
      type: 'varchar'
    }
  },
  aggregates: {
    questions: {
      type: 'n-n',
      table: 'question'
    }
  }
}
