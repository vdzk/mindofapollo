import { TableSchema } from "~/schema/type";

export const debate_confidence: TableSchema = {
  system: true,
  extendsTable: 'debate',
  expl: false,
  columns: {
    threshold_value: {
      type: 'proportion',
      instructions: "Whether Apollo's confidence in the statement will fall below or above the threshold will determine who is winning the debate."
    }
  }
}