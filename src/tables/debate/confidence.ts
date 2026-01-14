import { TableSchema } from "~/schema/type";

export const debate_confidence: TableSchema = {
  system: true,
  extendsTable: 'debate',
  expl: false,
  columns: {
    threshold_value: {
      type: 'proportion',
      instructions: "Whether confidence score will fall below or above the threshold will determine who is winning the debate."
    }
  }
}