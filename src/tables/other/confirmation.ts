import { TableSchema } from "~/schema/type";

export const confirmation: TableSchema = {
  plural: 'confirmations',
  extendsTable: 'question',
  columns: {
    count: {
      type: 'integer'
    }
  }
}