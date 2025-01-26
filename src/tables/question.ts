import { TableSchema } from "../schema/type";

export const question: TableSchema = {
  plural: 'questions',
  columns: {
    text: {
      type: 'varchar'
    },
    argument_aggregation_type_id: {
      type: 'fk',
      fk: {
        table: 'argument_aggregation_type',
        labelColumn: 'id',
        optional: true
      }
    },
    judgement_requested: {
      type: 'boolean',
      defaultValue: false,
      label: 'judgement',
      optionLabels: ['Not requested', 'requested']
    },
    decided: {
      type: 'boolean',
      defaultValue: false,
      label: 'status',
      optionLabels: ['Undecided', 'Decided']
    },
    answer: {
      type: 'varchar',
      getVisibility: record => record.decided as boolean
    },
    confidence: {
      type: 'proportion',
      getVisibility: record => record.decided as boolean
    },
    featured: {
      type: 'boolean',
      defaultValue: false
    }
  },
  aggregates: {
    arguments: {
      type: '1-n',
      table: 'argument',
      column: 'question_id',
      splitByColumn: 'pro'
    },
    research_notes: {
      type: '1-n',
      table: 'research_note',
      column: 'question_id'
    },
    answer_approvals: {
      type: 'n-n',
      table: 'person',
      first: true
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
    other: {
      label: 'other details'
    }
  }
}
