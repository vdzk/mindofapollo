import { TableSchema } from "../../schema/type";

export const role: TableSchema = {
  plural: 'roles',
  columns: {
    name: {
      type: 'varchar',
      preview: true
    },
    description: {
      type: 'text'
    }
  },
  aggregates: {
    rules: {
      type: '1-n',
      table: 'rule',
      column: 'role_id'
    }
  }
}
