import { TbChess } from "solid-icons/tb";
import { TableSchema } from "../schema/type";

export const argument_type: TableSchema = {
  plural: 'argument types',
  icon: TbChess,
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
