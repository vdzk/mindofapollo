import { TableSchema } from "~/schema/type";

export const confirmation: TableSchema = {
  plural: 'confirmations',
  extendsTable: 'statement',
  columns: {
    count: {
      type: 'integer'
    }
  }
}
