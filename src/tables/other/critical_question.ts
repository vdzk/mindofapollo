import { TableSchema } from "../../schema/type";

export const critical_question: TableSchema = {
  plural: 'critical questions',
  columns: {
    argument_type_id: {
      type: 'fk',
      fk: {
        table: 'argument_type',
        labelColumn: 'id'
      }
    },
    text: {
      type: 'varchar',
      preview: true
    }
  }
}
