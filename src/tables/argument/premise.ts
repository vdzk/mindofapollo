import { TableSchema } from "../../schema/type"

export const premise: TableSchema = {
  plural: 'premises',
  columns: {
    argument_id: {
      type: 'fk',
      fk: {
        table: 'argument',
        labelColumn: 'title',
        canDeleteIfCanEditParent: true
      }
    },
    statement_id: {
      type: 'fk',
      fk: {
        table: 'statement',
        labelColumn: 'label'
      },
      preview: true
    },
    statement_label: {
      type: 'virtual',
      fkColName: 'statement_id'
    },
    invert: {
      label: 'not',
      instructions: 'Check if the argument relies on the statement not being true.',
      type: 'boolean',
      defaultValue: false
    }
  }
}