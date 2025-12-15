import { TableSchema } from '~/schema/type'
import { defaultTextLines } from '../argument/argument'
import { argument_authority } from './authority'
import { argument_obvious } from './obvious'

const defaultTypes = ['analogy', 'causal', 'contradiction', 'deduction', 'definition', 'epistemic', 'example', 'explanation', 'feasibility', 'induction', 'statistical', 'extrapolation', 'normative', 'pragmatic', 'other', 'unknown'] as const

const defaultArgumentTypeSchema: TableSchema = {
  extendsTable: 'argument',
  columns: {
    text: {
      label: 'full version of the argument',
      type: 'text',
      lines: defaultTextLines
    }
  }
}

export const argumentTypeTables: Record<string, TableSchema> = {
  argument_authority,
  argument_obvious,
}

for (const type of defaultTypes) {
  argumentTypeTables[`argument_${type}`] = defaultArgumentTypeSchema
}
