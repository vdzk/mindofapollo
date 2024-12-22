import { TableSchema } from "../../schema/type";

export const role: TableSchema = {
  plural: 'roles',
  deny: ['INSERT', 'DELETE'],
  columns: {
    id: {
      // TODO: prevent editing this field
      type: 'varchar'
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
