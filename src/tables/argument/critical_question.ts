import { TableSchema } from "../../schema/type"

export const critical_question: TableSchema = {
  plural: 'critical questions',
  columns: {
    argument_type_id: {
      type: 'fk',
      fk: {
        table: 'argument_type',
        labelColumn: 'name',
        optional: true
      }
    },
    text: {
      type: 'varchar',
      preview: true
    }
  },
  aggregates: {
    statement_examples: {
      type: '1-n',
      table: 'critical_statement_example',
      column: 'critical_question_id'
    }
  }
}
