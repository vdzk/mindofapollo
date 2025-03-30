import { TableSchema } from "~/schema/type"

export const directive: TableSchema = {
  plural: 'directives',
  columns: {
    label: {
      type: 'virtual',
      queries: {
        deed: [
          ['id', 'directive_id'],
          ['deed_id', [
            ['text']
          ]]
        ],
        scope: [
          {startTable: 'directive_scope', fkName: 'directive_id'},
          ['directive_id'],
          ['include'],
          ['person_category_id', [
            ['name'],
          ]]
        ]
      },
      get: (ids, results) => {
        const directives = Object.fromEntries(ids.map(
          id => [id, {deed: '', scope: [[] as string[], [] as string[]]}]
        ))
        for (const deed of results.deed) {
          directives[deed.directive_id as number]
            .deed = deed.text as string
        }
        for (const scope of results.scope) {
          directives[scope.directive_id as number]
            .scope[Number(scope.include)].push(scope.name as string)
        }
        const labels = Object.fromEntries(ids.map(
          id => {
            const {deed, scope: [exclude, include]} = directives[id]
            return [id,
              `${include.join(' ,')}${exclude.length > 0 ? ' who is not a ' + exclude.join(' ,') : ''}, ${deed}`]
          }
        ))
        return labels
      }
    },
    deed_id: {
      type: 'fk',
      fk: {
        table: 'deed',
        labelColumn: 'text'
      }
    },
    featured: {
      type: 'boolean',
      defaultValue: false
    }
  },
  aggregates: {
    people_categories: {
      type: '1-n',
      table: 'directive_scope',
      column: 'directive_id'
    },
    consequences: {
      type: '1-n',
      table: 'directive_consequence',
      column: 'directive_id'
    },
    tags: {
      type: 'n-n',
      table: 'tag',
      first: true
    }
  }
}