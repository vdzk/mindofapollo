import { TableSchema } from "~/schema/type";

export const moral_persuasion: TableSchema = {
  columns: {
    title: {
      type: 'varchar'
    },
    moral_good_id: {
      type: 'fk',
      fk: {
        table: 'moral_good',
        labelColumn: 'name'
      }
    },
    pro: {
      type: 'boolean',
      label: 'side',
      optionLabels: ['Con', 'Pro']
    },
    text: {
      type: 'text'
    }
  },
  aggregates: {
    critiques: {
      type: '1-n',
      table: 'presuasion_critique',
      column: 'moral_persuasion_id'
    }
  }
}