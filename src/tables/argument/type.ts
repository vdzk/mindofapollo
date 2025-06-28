import { TableSchema } from "../../schema/type"

export const argumentTypes = [
  'authority', 'analogy', 'other', 'explanation', 'epistemic', 'deduction',
  'extrapolation', 'example', 'obvious', 'pragmatic', 'induction',
  'definition', 'causal', 'normative', 'contradiction', 'feasibility'
] as const

export const argument_type: TableSchema = {
  plural: 'argument types',
  columns: {
    name: {
      type: 'option',
      options: argumentTypes,
      preview: true
    },
    description: {
      type: 'text',
      lines: 4
    }
  },
  aggregates: {
    examples: {
      type: '1-n',
      table: 'argument_type_example',
      column: 'argument_type_id'
    },
    critical_questions: {
      type: '1-n',
      table: 'critical_question',
      column: 'argument_type_id'
    },
    certainty_criteria: {
      type: '1-n',
      table: 'argument_certainty_criterion',
      column: 'argument_type_id'
    },
    grading_examples: {
      type: '1-n',
      table: 'argument_grading_example',
      column: 'argument_type_id'
    },
    arguments: {
      type: '1-n',
      table: 'argument',
      column: 'argument_type_id'
    }
  }
}
