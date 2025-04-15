import { TableSchema } from "../../schema/type"

export const argument_type_example: TableSchema = {
  plural: 'argument type examples',
  columns: {
    argument_type_id: {
      type: 'fk',
      fk: {
        table: 'argument_type',
        labelColumn: 'name'
      }
    },
    argument: {
      type: 'text',
      lines: 4,
      preview: true
    },
    conclusion: {
      type: 'text',
      lines: 4
    }
  },
  aggregates: {
    critical_statements: {
      type: '1-n',
      table: 'critical_statement_example',
      column: 'argument_type_example_id'
    }
  }
}