import { TableSchema } from "~/schema/type"

export const conclusionPlaceholder = '(?) '

export const directive: TableSchema = {
  extendsTable: 'statement',
  plural: 'directives',
  columns: {
    label: {
      type: 'virtual',
      queries: {
        deeds: [
          {startTable: 'directive', fkName: 'id'}, // needed for statement table definition that imports this query
          ['id', 'directive_id'],
          ['deed_id', [
            ['text']
          ]]
        ],
        scopes: [
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
        for (const deed of results.deeds) {
          directives[deed.directive_id as number]
            .deed = deed.text as string
        }
        for (const scope of results.scopes) {
          directives[scope.directive_id as number]
            .scope[Number(scope.include)].push(scope.name as string)
        }
        const labels = Object.fromEntries(ids.map(
          id => {
            const {deed, scope: [exclude, include]} = directives[id]
            return [id,
              `${conclusionPlaceholder}${include.join(' and ')}${exclude.length > 0 ? ' (except ' + exclude.join(' and ') + ')' : ''} should ${deed}`]
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
      },
      instructions: 'After saving the statement, please visit the "Scope" tab and select people categories to which this directive applies.'
    }
  },
  aggregates: {
    people_categories: {
      type: '1-n',
      table: 'directive_scope',
      column: 'directive_id'
    }
  }
}