import { TableSchema } from "~/schema/type";

export const forum_thread: TableSchema = {
  plural: 'Forum threads',
  columns: {
    title: {
      type: 'varchar'
    }
  },
  aggregates: {
    posts: {
      type: '1-n',
      table: 'forum_post',
      column: 'thread_id'
    }
  }
}