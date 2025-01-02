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
  },
  aggregates: {
    person_categories: {
      type: 'n-n',
      table: 'person_category',
      first: true
    },
    moral_weights: {
      type: '1-n',
      table: 'moral_weight',
      column: 'person_id'
    }
  }
}
