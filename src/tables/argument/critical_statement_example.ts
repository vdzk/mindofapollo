import { TableSchema } from "../../schema/type"

export const critical_statement_example: TableSchema = {
  plural: 'critical statement examples',
  columns: {
    argument_type_example_id: {
      type: 'fk',
      fk: {
        table: 'argument_type_example',
        labelColumn: 'argument'
      }
    },
    critical_question_id: {
      type: 'fk',
      fk: {
        table: 'critical_question',
        labelColumn: 'text'
      }
    },
    statement: {
      type: 'text',
      lines: 4,
      preview: true
    }
  }
}