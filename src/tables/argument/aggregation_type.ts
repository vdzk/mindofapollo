import { TableSchema } from "../../schema/type";

export const argument_aggregation_type: TableSchema = {
  plural: 'argument aggregation types',
  columns: {
    name: {
      type: 'option',
      options: [
        'evidential',
        'additive'
      ],
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
      column: 'argument_aggregation_type_id'
    }
  }
}
