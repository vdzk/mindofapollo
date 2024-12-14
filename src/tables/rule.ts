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
    },
    example: {
      type: 'text',
      lines: 10,
      defaultValue: ''
    }
  },
  aggregates: {
    change_requests: {
      table: 'rule_change_request',
      type: '1-n',
      column: 'rule_id',
    }
  }
}