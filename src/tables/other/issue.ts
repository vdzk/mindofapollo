import { TableSchema } from "~/schema/type";

export const issue: TableSchema = {
  plural: 'issues',
  columns: {
    title: {
      type: 'varchar',
    },
    description: {
      type: 'text',
      lines: 10
    }
  }
}