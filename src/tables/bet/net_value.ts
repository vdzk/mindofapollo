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
      },
      instructions: 'Different people value things differently. Decide which moral profile will be used for the purposes of this bet.'
    },
    threshold_value: {
      type: 'integer',
      instructions: "Following the prescription in the satement will generate some (positive or negative) amount of value according to the moral profile. Whether this amount will fall below or above the threshold will determine the winner of the competition."
    },
    outcome_value: {
      type: 'integer',
      getVisibility: record => typeof record.outcome_value === 'number',
      defaultValue: null
    }
  }
}