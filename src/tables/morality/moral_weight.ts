import { TableSchema } from "~/schema/type"

export const moral_weight: TableSchema = {
  plural: 'moral weights',
  private: true,
  columns: {
    label: {
      type: 'virtual',
      queries: {
        moral_weight: [
          ['id'],
          ['weight'],
          ['moral_good_id', [
            ['name'],
            ['unit_id', [
              ['name', 'unit']
            ]]
          ]]
        ],
        // moral_weight: sqlStr`
        //   SELECT mw.id, mg.name, mw.weight, unit.name as unit
        //   FROM moral_weight mw
        //   JOIN moral_good mg
        //     ON mg.id = mw.moral_good_id
        //   JOIN unit
        //     ON unit.id = mg.unit_id
        //   WHERE mw.id = ANY($1::integer[])
        // `
      },
      get: (ids, results) => Object.fromEntries(results.moral_weight.map(
        result => [result.id,
          `(${result.weight} / ${result.unit}) ${result.name}`
        ]
      ))
    },
    owner_id: {
      type: 'fk',
      fk: {
        table: 'person',
        labelColumn: 'name'
      },
    },
    moral_good_id: {
      type: 'fk',
      fk: {
        table: 'moral_good',
        labelColumn: 'name',
      }
    },
    weight: {
      type: 'weight'
    },
  }
}