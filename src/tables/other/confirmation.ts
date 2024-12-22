import { TableSchema } from "~/schema/type";

export const confirmation: TableSchema = {
  extendsTable: 'question',
  columns: {
    count: {
      type: 'integer'
    }
  }
}