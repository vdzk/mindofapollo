import { DataRecord, TableSchema } from "../../schema/type";

export const critical_statement: TableSchema = {
  plural: 'critical statements',
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
        getLabel: (record: DataRecord) => record.decided
          ? `(c: ${record.confidence}) ${record.answer}`
          : record.text as string
      }
    }
  }
}
