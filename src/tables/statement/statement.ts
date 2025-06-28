import { TableSchema, VirtualColumnQueries } from "~/schema/type"
import { getPercent } from "~/utils/string"
import { directive } from "../morality/directive"

// Indexes corresponts to IDs in statement_type table
const statementExtensonTables = ['', '', '', 'directive']

export const chat_text = {
  type: 'text',
  lines: 4,
  instructions: "Used together with other chat texts to generate a chat conversation log between two opposing sides."
} as const

export const statement: TableSchema = {
  plural: 'statements',
  columns: {
    statement_type_id: {
      type: 'fk',
      fk: {
        table: 'statement_type',
        labelColumn: 'name',
        defaultName: 'descriptive',
        extensionTables: statementExtensonTables
      }
    },
    label: {
      type: 'virtual',
      preview: true,
      queries: {
        ...(directive.columns.label as VirtualColumnQueries).queries,
        statements: [
          ['id'],
          ['decided'],
          ['confidence'],
          ['text'],
          ['statement_type_id', [
            ['name', 'statement_type_name']
          ]]
        ]
      },
      get: (ids, results) => {
        const directivesLabels = (directive.columns.label as VirtualColumnQueries).get(ids, results)
        const labels = Object.fromEntries(results.statements.map(
          s => [s.id, s.statement_type_name === 'prescriptive'
            ? directivesLabels[s.id as number]
            : `(${s.decided ? getPercent(s.confidence as number) : '?'}) ${s.text}`
          ]
        ))
        return labels
      }
    },
    text: {
      type: 'text',
      lines: 4,
      getVisibility: record => record.statement_type_id !== statementExtensonTables.indexOf('directive'),
      defaultValue: '',
      instructions: "Please use the non-negative version of the statement (e.g. don't use the word \"not\"). Do not capialise the first word. Do not use a full stop at the end.",
    },
    chat_text,
    statement_type_name: {
      type: 'virtual',
      queries: {
        statement_types: [
          ['id'],
          ['statement_type_id', [
            ['name']
          ]]
        ],
      },
      get: (ids, results) => Object.fromEntries(results.statement_types.map(
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
      component: 'Arguments'
    },
    createArgument: {
      label: '➕ argument',
      component: 'CreateArgument'
    },
    evaluation: {
      label: 'evaluation',
      fields: ['statement_approvals', 'decided', 'confidence'],
    },
    discussion: {
      label: 'discussion',
      component: 'Discussion'
    },
    other: {
      label: 'other details'
    }
  }
}
