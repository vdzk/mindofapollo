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
        ]
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