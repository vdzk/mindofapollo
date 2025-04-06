import { ColumnType, TableSchema } from "~/schema/type";

export const unit: TableSchema = {
  plural: 'units',
  columns: {
    name: {
      type: 'varchar'
    },
    description: {
      type: 'text'
    },
    column_type: {
      type: 'option',
      options: [
        'boolean',
        'integer'
      ] as ColumnType[]
    }
  }
}