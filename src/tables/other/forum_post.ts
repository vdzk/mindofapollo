import { TableSchema } from "~/schema/type";

export const forum_post: TableSchema = {
  plural: 'Forum posts',
  columns: {
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
    },
    text: {
      type: 'text',
      lines: 5
    },
    label: {
      type: 'virtual',
      preview: true,
      queries: {
        posts: [
          ['id'],
          ['text'],
          ['owner_id', [
            ['name', 'author']
          ]]
        ]
      },
      get: (ids, results) => Object.fromEntries(results.posts.map(
        post => [post.id, `[${post.author}]: ${post.text}`]
      ))
    }
  }
}