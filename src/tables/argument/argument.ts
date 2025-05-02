import { TableSchema } from "../../schema/type"
import { argumentTypes } from "./type"

export const defautTextLines = 5

export const argument: TableSchema = {
  plural: 'arguments',
  columns: {
    statement_id: {
      type: 'fk',
      fk: {
        table: 'statement',
        labelColumn: 'label'
      }
    },
    pro: {
      type: 'boolean',
      label: 'side',
      optionLabels: ['Con', 'Pro']
    },
    title: {
      type: 'varchar',
      preview: true
    },
    argument_type_id: {
      type: 'fk',
      fk: {
        table: 'argument_type',
        labelColumn: 'name',
        extensionTables: ['', ...argumentTypes.map(t => `argument_${t}`)],
      }
    }
  },
  extendedByTable: 'argument_judgement',
  aggregates: {
    critical_statements: {
      type: '1-n',
      table: 'critical_statement',
      column: 'argument_id',
      splitByColumn: 'critical_question_id',
      filterSplitBy: 'argument_type_id',
      hideEmptySections: true,
      viewLink: {
        route: 'statement',
        idParamName: 'id',
        idParamSource: 'statement_id'
      }
    },
    judgements: {
      type: '1-n',
      table: 'argument_judgement',
      column: 'id'
    },
    conditionals: {
      type: '1-n',
      table: 'argument_conditional',
      column: 'id'
    },
    directive_consequences: {
      type: '1-n',
      table: 'directive_consequence',
      column: 'argument_id'
    }
  },
  sections: {
    details: {
      label: 'details',
      fields: ['statement_id', 'pro', 'argument_type_id']
    },
    criticism: {
      label: 'criticism',
      fields: ['critical_statements']
    },
    evaluation: {
      label: 'evaluation',
      fields: [ 'judgements', 'conditionals', 'directive_consequences']
    }
  }
}
