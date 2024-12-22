import { IoPersonSharp } from "solid-icons/io";
import { TableSchema } from "~/schema/type";

export const person: TableSchema = {
  plural: 'persons',
  icon: IoPersonSharp,
  columns: {
    name: {
      type: 'varchar'
    },
    email: {
      type: 'varchar'
    },
    password: {
      type: 'varchar'
    },
  }
}
