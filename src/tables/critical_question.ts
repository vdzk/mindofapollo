import { ImQuestion } from "solid-icons/im";
import { TableSchema } from "../schema/type";

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
  },
  initialData: [
    /*1*/['analogy', 'Are the statements used in the argument true?']
  ]
}
