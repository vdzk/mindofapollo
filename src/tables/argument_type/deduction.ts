import { TableSchema } from "../../schema/type";
import { defautTextLines } from "../argument/argument";

export const argument_deduction: TableSchema = {
  extendsTable: 'argument',
  columns: {
    text: {
      type: 'text',
      lines: defautTextLines
    }
  }
}
