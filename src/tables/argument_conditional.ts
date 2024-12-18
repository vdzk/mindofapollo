import { TableSchema } from "../schema/type";

export const argument_conditional: TableSchema = {
  extendsTable: 'argument',
  plural: 'conditional confidences',
  columns: {
    conditional_confidence: {
      preview: true,
      type: 'proportion'
    },
    conditional_explanation: {
      type: 'text',
      lines: 4
    },
  }
}