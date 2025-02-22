import { TableSchema } from "~/schema/type";

export const auth_role: TableSchema = {
  plural: 'auth. roles',
  columns: {
    name: {
      type: 'varchar'
    }
  },
  aggregates: {
    persons: {
      type: '1-n',
      table: 'person',
      column: 'auth_role_id'
    }
  }
}