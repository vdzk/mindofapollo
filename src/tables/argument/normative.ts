import { TableSchema } from "../../schema/type";

export const argument_normative: TableSchema = {
  extendsTable: 'argument',
  columns: {
    text: {
      type: 'text'
    }
  }
}