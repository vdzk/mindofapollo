import { TableSchema } from "~/schema/type";
import { argumentSideLabels } from "../argument/argument";

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
      optionLabels: argumentSideLabels
    },
    text: {
      type: 'text'
    }
  },
  aggregates: {
    critiques: {
      type: '1-n',
      table: 'persuasion_critique',
      column: 'moral_persuasion_id'
    }
  }
}