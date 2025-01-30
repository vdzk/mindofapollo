import { TableSchema } from "../../schema/type";

export const argument_aggregation_type: TableSchema = {
  plural: 'argument aggregation types',
  columns: {
    id: {
      // TODO: prevent editing this field
      type: 'varchar'
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
