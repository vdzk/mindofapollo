import { TableSchema } from "~/schema/type";

export const moral_weight_profile: TableSchema = {
  plural: 'moral weight profiles',
  columns: {
    name: {
      type: 'text'
    },
    description: {
      type: 'text',
      lines: 5
    }
  },
  aggregates: {
    moral_weights: {
      type: '1-n',
      table: 'moral_weight_of_profile',
      column: 'profile_id'
    }
  }
}