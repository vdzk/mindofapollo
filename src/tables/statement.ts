import { TableSchema, VirtualColumnQueries } from "~/schema/type"
import { getPercent } from "~/utils/string"
import { directive } from "./morality/directive"

// Indexes corresponts to IDs in argument_aggregation_type table
const argumentAggregationExtensonTables = ['', '', '', 'directive']

export const statement: TableSchema = {
  plural: 'statements',
  columns: {
    label: {
      type: 'virtual',
      queries: {
        ...(directive.columns.label as VirtualColumnQueries).queries,
        statements: [
          ['id'],
          ['decided'],
          ['confidence'],
          ['text'],
          ['argument_aggregation_type_id', [
            ['name', 'argument_aggregation_type_name']
          ]]
        ]
      },
      get: (ids, results) => {
        const directivesLabels = (directive.columns.label as VirtualColumnQueries).get(ids, results)
        const labels = Object.fromEntries(results.statements.map(
          s => [s.id, s.argument_aggregation_type_name === 'normative'
            ? directivesLabels[s.id as number]
            : `(${s.decided ? getPercent(s.confidence as number) : '?'}) ${s.text}`
          ]
        ))
        return labels
      }
    },
    text: {
      type: 'text',
      lines: 2,
      getVisibility: record => record.argument_aggregation_type_id !== argumentAggregationExtensonTables.indexOf('directive'),
      defaultValue: ''
    },
    argument_aggregation_type_id: {
      type: 'fk',
      fk: {
        table: 'argument_aggregation_type',
        labelColumn: 'name',
        defaultName: 'evidential',
        extensionTables: argumentAggregationExtensonTables
      }
    },
    argument_aggregation_type_name: {
      type: 'virtual',
      queries: {
        aggregation_types: [
          ['id'],
          ['argument_aggregation_type_id', [
            ['name']
          ]]
        ],
      },
      get: (ids, results) => Object.fromEntries(results.aggregation_types.map(
        result => [result.id, result.name]
      ))
    },
    decided: {
      type: 'boolean',
      defaultValue: false,
      label: 'status',
      optionLabels: ['Undecided', 'Decided'],
      readOnly: true
    },
    confidence: {
      type: 'proportion',
      getVisibility: record => record.decided as boolean,
      defaultValue: 0.5,
      readOnly: true
    },
    featured: {
      type: 'boolean',
      defaultValue: false,
      readOnly: true
    }
  },
  aggregates: {
    arguments: {
      type: '1-n',
      table: 'argument',
      column: 'statement_id',
      splitByColumn: 'pro'
    },
    research_notes: {
      type: '1-n',
      table: 'research_note',
      column: 'statement_id'
    },
    tags: {
      type: 'n-n',
      table: 'tag',
      first: true
    }
  },
  sections: {
    arguments: {
      label: 'arguments',
      fields: ['arguments']
    },
    evaluation: {
      label: 'evaluation',
      fields: ['statement_approvals', 'decided', 'confidence'],
    },
    other: {
      label: 'other details'
    }
  },
  advanced: ['argument_aggregation_type_id']
}
