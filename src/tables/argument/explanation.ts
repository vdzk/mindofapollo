import { TableSchema } from "../../schema/type";

export const argument_explanation: TableSchema = {
  extendsTable: 'argument',
  columns: {
    text: {
      type: 'text',
      lines: 8
    }
  }
};