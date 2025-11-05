import { TableSchema } from "~/schema/type";

export const forum_post: TableSchema = {
  plural: 'Forum posts',
  columns: {
    text: {
      type: 'text',
      lines: 5
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
    thread_id: {
      type: 'fk',
      label: 'thread',
      fk: {
        table: 'forum_thread',
        labelColumn: 'title'
      }
    },
    owner_id: {
      type: 'fk',
      label: 'author',
      fk: {
        table: 'person',
        labelColumn: 'name'
      }
    }
  }
}