import { TableSchema } from "../../schema/type";

export const argument_obvious: TableSchema = {
  extendsTable: 'argument',
  columns: {
    obvious_to_majority: {
      label: 'This statement is obviously true to the vast majority of people.',
      type: 'boolean'
    },
    majority_is_qualified: {
      label: 'The majority of people who think this statement is true are qualified to judge it.',
      type: 'boolean'
    }
  }
}
