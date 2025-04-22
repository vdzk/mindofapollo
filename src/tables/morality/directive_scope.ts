import { TableSchema } from "~/schema/type"

export const directive_scope: TableSchema = {
  plural: 'directive scopes',
  columns: {
    label: {
      type: 'virtual',
      queries: {
        person_category: [
          ['id'],
          ['include'],
          ['person_category_id', [
            ['name']
          ]]
        ]
      },
      get: (ids, results) => Object.fromEntries(results.person_category.map(
        result => [result.id, `(${result.include ? '+' : '−'}) ${result.name}`]
      ))
    },
    directive_id: {
      type: 'fk',
      fk: {
        table: 'directive',
        labelColumn: 'label'
      }
    },
    person_category_id: {
      type: 'fk',
      fk: {
        table: 'person_category',
        labelColumn: 'name'
      }
    },
    include: {
      label: 'Include or exclude the category from the prescription',
      type: 'boolean',
      defaultValue: true,
      optionLabels: ['Exclude', 'Include']
    }
  }
}