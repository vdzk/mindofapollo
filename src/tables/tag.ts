import { ImPriceTag } from "solid-icons/im";
import { TableSchema } from "../schema/type";

export const tag: TableSchema = {
  plural: 'tags',
  icon: ImPriceTag,
  columns: {
    name: {
      type: 'varchar'
    }
  },
  aggregates: {
    questions: {
      type: 'n-n',
      table: 'question'
    }
  },
  initialData: [
    /*1*/['silly']
  ]
}
