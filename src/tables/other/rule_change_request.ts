import { TableSchema } from "~/schema/type";

export const rule_change_request: TableSchema = {
  plural: 'rule change requests',
  columns: {
    title: {
      type: 'varchar',
      defaultValue: ''
    },
    text: {
      type: 'text',
      lines: 10
    },
    link: {
      type: 'link_url'
    },
    response: {
      type: 'text',
      lines: 4
    },
    rule_id: {
      type: 'fk',
      fk: {
        table: 'rule',
        labelColumn: 'name',
        optional: true
      }
    }
  }
}