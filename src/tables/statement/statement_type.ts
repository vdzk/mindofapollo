import { TableSchema } from "../../schema/type";

const statementTypes = [
  'descriptive',
  'threshold',
  'prescriptive'
] as const;

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
