import { TableSchema } from "../../schema/type";

const argumentAggretationTypes = [
  'evidential',
  'additive',
  'normaive'
] as const;

export type ArgumentAggregationType = typeof argumentAggretationTypes[number];

export const argument_aggregation_type: TableSchema = {
  plural: 'argument aggregation types',
  columns: {
    name: {
      type: 'option',
      options: argumentAggretationTypes,
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
