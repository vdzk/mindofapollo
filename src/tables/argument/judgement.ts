import { TableSchema } from "../../schema/type";

export const argument_judgement: TableSchema = {
  extendsTable: 'argument',
  plural: 'argument judgements',
  columns: {
    isolated_confidence: {
      preview: true,
      type: 'proportion',
      label: 'confidence'
    },
    isolated_explanation: {
      type: 'text',
      lines: 4,
      label: 'explanation'
    }
  }
}