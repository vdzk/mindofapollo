import { ImPriceTag } from "solid-icons/im";
import { TableSchema } from "../type";

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
  }
}