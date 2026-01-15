import { TableSchema, TextColumn, VirtualColumnQueries } from "~/schema/type"
import { getPercent } from "~/utils/string"
import { directive } from "../morality/directive"
import { statementTypeIds } from "./statement_type"

export const getTextFromLabel = (label: string) => label.slice(
  label.indexOf(') ') + 1
)
export const getConfidenceFromLabel = (label: string) => label.slice(
  1, label.indexOf(') ')
)

export const chat_text: TextColumn = {
  type: 'text',
  lines: 4,
  instructions: "Used together with other chat texts to generate a chat conversation log between two opposing sides.",
  // TODO: remove chat view from the system
  // getVisibility: (record) => !!record.id,
  getVisibility: () => false,
  defaultValue: ''
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
        extensionTables: ['', '', '', 'directive']
      }
    },
    label: {
      type: 'virtual',
      preview: true,
      queries: {
        ...(directive.columns.label as VirtualColumnQueries).queries,
        statements: [
          ['id'],
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
            : `(${getPercent(s.confidence as number)}) ${s.text}`
          ]
        ))
        return labels
      }
    },
    text: {
      type: 'text',
      lines: 4,
      getVisibility: record => record.statement_type_id !== statementTypeIds.prescriptive,
      defaultValue: '',
      instructions: "Please use the non-negative version of the statement (e.g. don't use the word \"not\").",
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
    confidence: {
      type: 'proportion',
      defaultValue: 0.5,
      instructions: 'Confidences of statements without any judged arguments can be set manually. Otherwise they are calculated automatically.',
      canEditCondition: {
        colName: 'has_judged_argument',
        value: false
      },
      getVisibility: (record) => record.statement_type_id !== statementTypeIds.prescriptive
    },
    has_judged_argument: {
      label: 'has a judged argument',
      type: 'virtual',
      displayType: 'boolean',
      serverFn: true
    },
    featured: {
      type: 'boolean',
      defaultValue: false,
      readOnly: true
    }
  },
  advanced: ['chat_text'],
  aggregates: {
    definitions: {
      type: 'n-n',
      table: 'definition',
      first: true
    },
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
      label: '➕ Add argument',
      component: 'CreateArgument'
    },
    definitions: {
      label: 'definitions',
      fields: ['definitions']
    },
    scope: {
      label: 'scope',
      component: 'DirectiveScope',
      getVisibility: (record) => record.statement_type_name === 'prescriptive'
    },
    other: {
      label: 'other details'
    }
  },
  discussion: {
    tableName: 'statement_discussion_message',
    fkName: 'statement_id',
    textColName: 'text',
    userNameColName: 'user_name'
  }
}
