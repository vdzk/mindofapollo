import { TableSchema } from "../../schema/type"

export const argument_certainty_criterion: TableSchema = {
  plural: 'argument certainty criteria',
  columns: {
    argument_type_id: {
      type: 'fk',
      fk: {
        table: 'argument_type',
        labelColumn: 'name'
      }
    },
    min_value: {
      type: 'proportion'
    },
    max_value: {
      type: 'proportion'
    },
    description: {
      type: 'text',
      lines: 4,
      preview: true
    }
  }
}