import { ColumnType, TableSchema } from "~/schema/type";

export const unit: TableSchema = {
  plural: 'units',
  columns: {
    name: {
      type: 'varchar'
    },
    description: {
      type: 'text',
      lines: 6
    },
    column_type: {
      type: 'option',
      options: [
        'boolean',
        'integer',
        'weight'
      ] as ColumnType[]
    }
  }
}