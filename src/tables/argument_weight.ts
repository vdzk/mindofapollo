import { TableSchema } from "../schema/type";

// TODO: If there is a partial duplication between two factors, in addition to the isolated weight, the judge should provide a discounted independent weight. That’s the additional weight that the argument brings given the arguments that were already weighted. Isolated weight must still be given to avoid confusion when another argument will be weighted against this argument. 

export const argument_weight: TableSchema = {
  extendsTable: 'argument',
  plural: 'arguments weights',
  columns: {
    weight_lower_limit: {
      type: 'weight'
    },
    weight_mode: {
      type: 'weight'
    },
    weight_upper_limit: {
      type: 'weight'
    },
    weight_explanation: {
      type: 'varchar'
    }
  }
}