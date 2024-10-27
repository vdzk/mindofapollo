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
    tags: {
      type: 'n-n',
      table: 'tag',
      first: true
    }
  }
}