import { ImQuestion } from "solid-icons/im";
import { TableSchema } from "../type";

export const critical_question: TableSchema = {
  plural: 'critical questions',
  icon: ImQuestion,
  columns: {
    argument_type_id: {
      type: 'fk',
      fk: {
        table: 'argument_type',
        labelColumn: 'id'
      }
    },
    text: {
      type: 'varchar',
      preview: true
    }
  }
}