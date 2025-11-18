import { TableSchema } from "~/schema/type";

export const bet_confidence: TableSchema = {
  system: true,
  extendsTable: 'bet',
  expl: false,
  columns: {
    threshold_value: {
      type: 'proportion',
      instructions: "Whether Apollo's confidence in the statement will fall below or above the threshold will determine the winner of the competition."
    },
    outcome_value: {
      type: 'proportion',
      getVisibility: record => typeof record.outcome_value === 'number',
      defaultValue: null
    }
  }
}