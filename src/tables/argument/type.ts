import { TableSchema } from "../../schema/type"

export const argumentTypes = ['authority', 'analogy', 'other', 'explanation', 'epistemic', 'deduction', 'comparison', 'example', 'obvious', 'normative'] as const

export const argument_type: TableSchema = {
  plural: 'argument types',
  columns: {
    name: {
      type: 'option',
      options: argumentTypes,
      preview: true
    },
    description: {
      type: 'text'
    }
  },
  aggregates: {
    critical_questions: {
      type: '1-n',
      table: 'critical_question',
      column: 'argument_type_id'
    },
    arguments: {
      type: '1-n',
      table: 'argument',
      column: 'argument_type_id'
    }
  }
}
