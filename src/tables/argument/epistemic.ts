import { TableSchema } from "../../schema/type";

export const argument_epistemic: TableSchema = {
  extendsTable: 'argument',
  columns: {
    text: {
      type: 'text'
    }
  }
}
