import { ColumnType, TableSchema } from "~/schema/type";

export const unit: TableSchema = {
  plural: 'units',
  columns: {
    name: {
      type: 'varchar'
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