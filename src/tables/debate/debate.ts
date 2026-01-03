import { TableSchema } from "~/schema/type"

export const debate: TableSchema = {
  system: true,
  expl: false,
  plural: 'Debates',
  columns: {
    creator_id: {
      label: 'creator',
      type: 'fk',
      fk: {
        table: 'person',
        labelColumn: 'name'
      }
    },
    creator_name: {
      type: 'virtual',
      fkColName: 'creator_id',
    },
    statement_id: {
      type: 'fk',
      fk: {
        table: 'statement',
        labelColumn: 'label',
        extensionColumn: 'statement_type_id',
        extensionTables: ['', 'debate_confidence', 'debate_confidence', 'debate_net_value']
      },
      instructions: 'Select a statement the will the subject of the debate.'
    },
    statement_type_id: {
      type: 'virtual',
      fkColName: 'statement_id',
      fkTargetColName: 'statement_type_id'
    },
    statement_label: {
      type: 'virtual',
      fkColName: 'statement_id',
      preview: true
    },
    creator_above: {
      label: "Your side",
      type: 'boolean',
      optionLabels: ['Below', 'Above'],
      instructions: 'Decide which side of the threshold you are going to take.'
    },
    taker_id: {
      label: 'taker',
      type: 'fk',
      fk: {
        table: 'person',
        labelColumn: 'name',
        optional: true
      },
      getVisibility: record => typeof record.taker_id === 'number',
      defaultValue: null
    },
    taker_name: {
      type: 'virtual',
      fkColName: 'taker_id',
    },
    creator_won: {
      type: 'boolean',
      getVisibility: record => typeof record.creator_won === 'boolean',
      defaultValue: null
    }
  }
}