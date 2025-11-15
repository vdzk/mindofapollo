import { TableSchema } from "~/schema/type";

export const bet_confidence: TableSchema = {
  system: true,
  extendsTable: 'bet',
  expl: false,
  columns: {
    threshold_value: {
      type: 'proportion'
    },
    outcome_value: {
      type: 'proportion',
      getVisibility: record => record.outcome_value !== null
    }
  }
}