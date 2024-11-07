import { BsExclamationDiamondFill } from "solid-icons/bs";
import { TableSchema } from "../type";
import { Row } from "postgres";

export const critical_statement: TableSchema = {
  plural: 'critical statements',
  icon: BsExclamationDiamondFill,
  columns: {
    argument_id: {
      type: 'fk',
      fk: {
        table: 'argument',
        labelColumn: 'title'
      }
    },
    critical_question_id: {
      type: 'fk',
      fk: {
        table: 'critical_question',
        labelColumn: 'text'
        // TODO: argument_type of the argument should match argument_type of the question
      }
    },
    question_answer_id: {
      type: 'fk',
      label: 'statement',
      preview: true,
      fk: {
        table: 'question',
        labelColumn: 'answer',
        getLabel: (record: Row) => record.decided
          ? `(c: ${record.confidence}) ${record.answer}`
          : record.text
      }
    }
  }
}