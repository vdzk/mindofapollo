import { TableSchema } from "~/schema/type";

export const forum_thread: TableSchema = {
  plural: 'Forum threads',
  columns: {
    title: {
      type: 'varchar'
    }
  },
  discussion: {
    tableName: 'forum_post',
    fkName: 'thread_id',
    textColName: 'text',
    userNameColName: 'user_name',
    showFirst: true
  }
}