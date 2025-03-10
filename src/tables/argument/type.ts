import { ForeignKey, TableSchema } from "../../schema/type";
import { argument } from "./argument";

export const argument_type: TableSchema = {
  plural: 'argument types',
  columns: {
    name: {
      type: 'option',
      options: (argument.columns.argument_type_id as ForeignKey).fk.extensionTables!.slice(1),
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
