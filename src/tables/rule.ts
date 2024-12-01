import { TableSchema } from "../schema/type";

export const rule: TableSchema = {
  plural: 'rules',
  columns: {
    role_id: {
      type: 'fk',
      fk: {
        table: 'role',
        labelColumn: 'id'
      }
    },
    name: {
      type: 'varchar',
      preview: true
    },
    text: {
      type: 'text'
    }
  }
}