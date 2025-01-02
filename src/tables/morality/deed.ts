import { TableSchema } from "../../schema/type";

export const deed: TableSchema = {
  plural: 'deeds',
  columns: {
    text: {
      type: 'varchar'
    }
  },
  aggregates: {
    directives: {
      type: '1-n',
      table: 'directive',
      column: 'deed_id'
    }
  }
}