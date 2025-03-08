import { TableSchema } from "../../schema/type";

export const argument_deduction: TableSchema = {
  extendsTable: 'argument',
  columns: {
    text: {
      type: 'text',
      lines: 10
    }
  }
}
