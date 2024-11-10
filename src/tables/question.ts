import { RiCommunicationQuestionnaireFill } from "solid-icons/ri";
import { DataRecord, TableSchema } from "../schema/type";

export const question: TableSchema = {
  plural: 'questions',
  icon: RiCommunicationQuestionnaireFill,
  columns: {
    text: {
      type: 'varchar'
    },
    decided: {
      type: 'boolean',
      label: 'status',
      optionLabels: ['Undecided', 'Decided']
    },
    answer: {
      type: 'varchar',
      getVisibility: (record: DataRecord) => record.decided as boolean
    },
    confidence: {
      type: 'proportion',
      getVisibility: (record: DataRecord) => record.decided as boolean
    }
  },
  aggregates: {
    arguments: {
      type: '1-n',
      table: 'argument',
      column: 'question_id',
      splitByColumn: 'pro'
    },
    research_notes: {
      type: '1-n',
      table: 'research_note',
      column: 'question_id'
    },
    tags: {
      type: 'n-n',
      table: 'tag',
      first: true,
      initialData: [
        [1, 1]
      ]
    }
  },
  initialData: [
    /*1*/['Is the Moon made out of cheese?', false, 'The Moon is not made out of cheese', 1],
    /*2*/['Is all cheese round?', false, 'Not all cheese is round.', 1],
  ]
}
