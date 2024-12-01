import { TableSchema } from "../schema/type";

export const argument_judgement: TableSchema = {
  extendsTable: 'argument',
  columns: {
    explanation: {
      type: 'text',
      lines: 4
    },
    strength: {
      type: 'proportion'
    }
  }
}