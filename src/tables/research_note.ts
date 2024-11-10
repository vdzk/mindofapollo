import { TableSchema } from "../schema/type";
import { VsNote } from 'solid-icons/vs'

export const research_note: TableSchema = {
  plural: 'research notes',
  icon: VsNote,
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
