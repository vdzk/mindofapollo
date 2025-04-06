import { ColumnSchema, TableSchema } from "~/schema/type"

export const moralWeightColumns: Record<string, ColumnSchema> = {
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

export const moral_weight_of_person: TableSchema = {
  plural: 'moral weights',
  private: true,
  columns: {
    ...moralWeightColumns,
    owner_id: {
      type: 'fk',
      fk: {
        table: 'person',
        labelColumn: 'name'
      }
    }
  }
}

export const moral_weight_of_profile: TableSchema = {
  plural: 'moral weights',
  columns: {
    ...moralWeightColumns,
    profile_id: {
      type: 'fk',
      fk: {
        table: 'moral_weight_profile',
        labelColumn: 'name'
      }
    }
  }
}