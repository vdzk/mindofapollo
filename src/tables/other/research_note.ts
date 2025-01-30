import { TableSchema } from "../../schema/type";

export const research_note: TableSchema = {
  plural: 'research notes',
  columns: {
    statement_id: {
      type: 'fk',
      fk: {
        table: 'statement',
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
