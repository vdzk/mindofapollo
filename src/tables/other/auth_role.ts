import { TableSchema } from "~/schema/type";
import { authRoles } from "~/types";

export const auth_role: TableSchema = {
  plural: 'auth. roles',
  system: true,
  seed: true,
  columns: {
    name: {
      type: 'option',
      options: authRoles
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