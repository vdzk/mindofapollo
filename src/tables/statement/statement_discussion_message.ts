import { TableSchema } from "~/schema/type";

export const statement_discussion_message: TableSchema = {
  plural: 'statement discussion messages',
  expl: false,
  columns: {
    text: {
      type: 'text',
      lines: 2
    },
    user_name: {
      type: 'virtual',
      queries: {
        users: [
          ['id', 'message_id'],
          ['owner_id', [
            ['name']
          ]]
        ]
      },
      get: (ids, records) => Object.fromEntries(records.users.map(
        user => [user.message_id, user.name]
      ))
    },
    statement_id: {
      type: 'fk',
      fk: {
        table: 'statement',
        labelColumn: 'label'
      }
    },
    owner_id: {
      type: 'fk',
      label: 'author',
      fk: {
        table: 'person',
        labelColumn: 'name'
      }
    },
  }
}