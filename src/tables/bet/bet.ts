import { TableSchema } from "~/schema/type"

export const bet: TableSchema = {
  system: true,
  expl: false,
  columns: {
    creator_id: {
      type: 'fk',
      fk: {
        table: 'person',
        labelColumn: 'name'
      }
    },
    statement_id: {
      type: 'fk',
      fk: {
        table: 'statement',
        labelColumn: 'text',
        extensionColumn: 'statement_type_id',
        extensionTables: ['', 'bet_confidence', 'bet_confidence', 'bet_net_value']
      }
    },
    creator_above: {
      type: 'boolean'
    },
    stake: {
      type: 'integer'
    },
    duration_days: {
      type: 'integer'
    },
    taker_id: {
      type: 'fk',
      fk: {
        table: 'person',
        labelColumn: 'name',
        optional: true
      },
      getVisibility: record => record.taker_id !== null
    },
    start_date: {
      type: 'date',
      getVisibility: record => record.start_date !== null
    },
    creator_won: {
      type: 'boolean',
      getVisibility: record => record.creator_won !== null
    }
  }
}