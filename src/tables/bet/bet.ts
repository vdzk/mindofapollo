import { TableSchema } from "~/schema/type"

export const bet: TableSchema = {
  system: true,
  expl: false,
  plural: 'Compete to Convince',
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
        extensionTables: ['', 'bet_confidence', 'bet_confidence', 'bet_net_value']
      },
      instructions: 'Select a statement the will the subject of the competition.'
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
      instructions: 'Decide which side of the bet you are going to take. Below or above the threshold.'
    },
    stake: {
      label: 'stake (# competition credits)',
      type: 'integer',
      instructions: 'Decide how many of you competition credits would you like to risk on this bet. Your opponent will have to match your bet. Winner takes all.'
    },
    duration_days: {
      label: 'bet duration (# days)',
      type: 'integer',
      instructions: "The competion starts when somebody takes your bet. Decide how long it will last. At the end of this period Apollo's opinion about the statement will determine the outcome of the bet."
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
    start_date: {
      type: 'date',
      getVisibility: record => typeof record.start_date === 'string',
      defaultValue: null
    },
    creator_won: {
      type: 'boolean',
      getVisibility: record => typeof record.creator_won === 'boolean',
      defaultValue: null
    }
  }
}