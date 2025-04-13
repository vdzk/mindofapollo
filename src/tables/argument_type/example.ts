import { TableSchema } from "../../schema/type";
import { defautTextLines } from "../argument/argument";

export const argument_example: TableSchema = {
  extendsTable: 'argument',
  columns: {
    text: {
      type: 'text',
      lines: defautTextLines
    }
  }
}
