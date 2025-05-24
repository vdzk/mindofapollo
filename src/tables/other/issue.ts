import { TableSchema } from "~/schema/type";

export const issue: TableSchema = {
  plural: 'issues',
  optionallyExtendedByTable: 'task',
  columns: {
    title: {
      type: 'text',
    },
    description: {
      type: 'text',
      lines: 10,
      defaultValue: ''
    },
  }
}