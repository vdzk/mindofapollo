import { TableSchema } from "../../schema/type";

export const argument_example: TableSchema = {
  extendsTable: 'argument',
  columns: {
    text: {
      type: 'text',
      lines: 10
    }
  }
}
