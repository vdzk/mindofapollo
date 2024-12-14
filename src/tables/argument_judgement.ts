import { TableSchema } from "../schema/type";

export const argument_judgement: TableSchema = {
  extendsTable: 'argument',
  plural: 'argument judgements',
  columns: {
    explanation: {
      type: 'text',
      lines: 4
    },
    strength: {
      preview: true,
      type: 'proportion'
    }
  }
}