import { TableSchema } from "~/schema/type"

export const moral_good: TableSchema = {
  plural: 'moral goods',
  columns: {
    label: {
      type: 'virtual',
      queries: {
        label: [
          ['id'],
          ['name'],
          ['unit_id', [
            ['name', 'unit']
          ]]
        ]
      },
      get: (ids, results) => Object.fromEntries(results.label.map(
        result => [result.id, `${result.name} (${result.unit})`]
      ))
    },
    name: {
      type: 'varchar',
    },
    description: {
      type: 'text',
      lines: 6
    },
    unit_id: {
      type: 'fk',
      fk: {
        table: 'unit',
        labelColumn: 'name'
      }
    }
  },
  aggregates: {
    persuasions: {
      type: '1-n',
      table: 'moral_persuasion',
      column: 'moral_good_id'
    }
  }
}