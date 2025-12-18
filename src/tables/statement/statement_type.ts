import { TableSchema } from "../../schema/type"

const statementTypes = [
  'descriptive',
  'threshold',
  'prescriptive'
] as const

export const descriptiveStatementTypeId = statementTypes.indexOf('descriptive') + 1
export const prescriptiveStatementTypeId = statementTypes.indexOf('prescriptive') + 1

export type StatementType = typeof statementTypes[number];

export const statement_type: TableSchema = {
  plural: 'statement types',
  seed: true,
  columns: {
    name: {
      type: 'option',
      options: statementTypes,
      preview: true,
      unique: true
    },
    description: {
      type: 'text'
    }
  },
  aggregates: {
    statements: {
      type: '1-n',
      table: 'statement',
      column: 'statement_type_id'
    }
  }
}
