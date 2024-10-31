import { RiCommunicationQuestionnaireFill } from "solid-icons/ri";
import { TableSchema } from "../type";

export const question: TableSchema = {
  plural: 'questions',
  icon: RiCommunicationQuestionnaireFill,
  columns: {
    text: {
      type: 'varchar'
    },
    answer: {
      type: 'varchar'
    },
    confidence: {
      type: 'proportion'
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
    /*1*/['Is the Moon made out of cheese?', 'The Moon is not made out of cheese', 1],
    /*2*/['Is all cheese round?', 'Not all cheese is round.', 1],
  ]
}