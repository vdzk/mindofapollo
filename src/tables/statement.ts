import { getPercent } from "~/util";
import { TableSchema } from "../schema/type";

export const statement: TableSchema = {
  plural: 'statements',
  columns: {
    text: {
      type: 'varchar'
    },
    argument_aggregation_type_id: {
      type: 'fk',
      fk: {
        table: 'argument_aggregation_type',
        labelColumn: 'name',
        defaultValueLabel: 'evidential',
        optional: true
      }
    },
    decided: {
      type: 'boolean',
      defaultValue: false,
      label: 'status',
      optionLabels: ['Undecided', 'Decided']
    },
    confidence: {
      type: 'proportion',
      getVisibility: record => record.decided as boolean,
      defaultValue: 0.5
    },
    judgement_requested: {
      type: 'boolean',
      defaultValue: false,
      label: 'judgement',
      optionLabels: ['Not requested', 'requested']
    },
    featured: {
      type: 'boolean',
      defaultValue: false
    },
    label: {
      type: 'virtual',
      getLocal: (record) => `(${record.decided ? getPercent(record.confidence as number) : '?'}) ${record.text}`,
      preview: true
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
    statement_approvals: {
      type: 'n-n',
      table: 'person',
      first: true
    },
    confirmations: {
      type: '1-n',
      table: 'confirmation',
      column: 'id'
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
      fields: [
        'confirmations', 'statement_approvals', 'decided',
        'confidence', 'judgement_requested'
      ]
    },
    other: {
      label: 'other details'
    }
  },
  advanced: ['argument_aggregation_type_id']
}
