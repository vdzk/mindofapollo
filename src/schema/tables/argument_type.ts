import { TbChess } from "solid-icons/tb";
import { TableSchema } from "../type";

export const argument_type: TableSchema = {
  plural: 'argument types',
  icon: TbChess,
  columns: {
    label: {
      type: 'varchar'
    }
  },
  aggregates: {
    critical_questions: {
      type: '1-n',
      table: 'critical_question',
      column: 'argument_type_id'
    },
    argumens: {
      type: '1-n',
      table: 'argument',
      column: 'argument_type_id'
    }
  }
}