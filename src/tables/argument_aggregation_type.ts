import { TableSchema } from "../schema/type";

export const argument_aggregation_type: TableSchema = {
  plural: 'argument aggregation types',
  deny: ['INSERT', 'DELETE'],
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
    questions: {
      type: '1-n',
      table: 'question',
      column: 'argument_aggregation_type_id'
    }
  }
}
