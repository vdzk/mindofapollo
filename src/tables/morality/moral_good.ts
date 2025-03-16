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
        ],
        // label: sqlStr`
        //   SELECT moral_good.id, moral_good.name, unit.name as unit
        //   FROM moral_good
        //   JOIN unit
        //     ON unit.id = moral_good.unit_id
        //   WHERE moral_good.id = ANY($1::integer[])
        // `
      },
      get: (ids, results) => Object.fromEntries(results.label.map(
        result => [result.id, `${result.name} (${result.unit})`]
      ))
    },
    name: {
      type: 'varchar',
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