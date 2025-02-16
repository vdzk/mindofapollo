import { TableSchema } from "~/schema/type";

export const chat_message: TableSchema = {
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