import { TableSchema } from "~/schema/type"
import { getPercent } from "~/utils/string"

export const statement: TableSchema = {
  plural: 'statements',
  columns: {
    label: {
      type: 'virtual',
      getLocal: (record) => `(${record.decided ? getPercent(record.confidence as number) : '?'}) ${record.text}`,
      preview: true
    },
    text: {
      type: 'text',
      lines: 2
    },
    argument_aggregation_type_id: {
      type: 'fk',
      fk: {
        table: 'argument_aggregation_type',
        labelColumn: 'name',
        defaultName: 'evidential',
        optional: true
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
    },
    directive_consequences: {
      type: '1-n',
      table: 'directive_consequence',
      column: 'id'
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
