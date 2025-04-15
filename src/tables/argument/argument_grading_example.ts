import { TableSchema } from "../../schema/type"

export const argument_grading_example: TableSchema = {
  plural: 'argument grading examples',
  columns: {
    argument_type_id: {
      type: 'fk',
      fk: {
        table: 'argument_type',
        labelColumn: 'name'
      }
    },
    grade: {
      type: 'proportion'
    },
    argument: {
      type: 'text',
      lines: 4,
      preview: true
    },
    conclusion: {
      type: 'text',
      lines: 4
    },
    explanation: {
      type: 'text',
      lines: 4
    }
  }
}