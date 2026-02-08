import { TableSchema } from "~/schema/type";

export const top_level_claim_idea: TableSchema = {
  columns: {
    text: {
      type: 'text',
      lines: 4
    }
  }
}