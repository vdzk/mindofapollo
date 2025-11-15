import { TableSchema } from "~/schema/type"

export const bet_net_value: TableSchema = {
  system: true,
  extendsTable: 'bet',
  expl: false,
  columns: {
    moral_weight_profile_id: {
      type: 'fk',
      fk: {
        table: 'moral_weight_profile',
        labelColumn: 'name'
      }
    },
    threshold_value: {
      type: 'integer'
    },
    outcome_value: {
      type: 'integer',
      getVisibility: record => record.outcome_value !== null
    }
  }
}