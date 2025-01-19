import { TableSchema } from "../../schema/type";

export const research_note: TableSchema = {
  plural: 'research notes',
  columns: {
    question_id: {
      type: 'fk',
      fk: {
        table: 'question',
        labelColumn: 'text'
      }
    },
    title: {
      type: 'varchar',
      preview: true
    },
    text: {
      type: 'text'
    }
  }
}
