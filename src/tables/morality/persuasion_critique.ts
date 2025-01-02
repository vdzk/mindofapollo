import { DataRecord, TableSchema } from "~/schema/type";

export const presuasion_critique: TableSchema = {
  plural: 'persuasion critiques',
  columns: {
    moral_persuasion_id: {
      type: 'fk',
      fk: {
        table: 'moral_persuasion',
        labelColumn: 'title'
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