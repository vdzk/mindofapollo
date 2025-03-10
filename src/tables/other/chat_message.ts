import { TableSchema } from "~/schema/type";

export const chat_message: TableSchema = {
  translate: false,
  expl: false,
  columns: {
    text: {
      type: 'text'
    },
    user_id: {
      type: 'fk',
      fk: {
        table: 'person',
        labelColumn: 'name'
      }
    },
    timestamp: {
      type: 'integer'
    }
  }
}