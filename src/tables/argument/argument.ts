import { getPercent } from "~/util";
import { DataRecord, TableSchema } from "../../schema/type";

export const argument: TableSchema = {
  plural: 'arguments',
  columns: {
    statement_id: {
      type: 'fk',
      fk: {
        table: 'statement',
        labelColumn: 'text'
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
        extensionTables: ['','authority', 'analogy', 'other', 'explanation', 'epistemic', 'deduction', 'comparison', 'example']
      }
    },
    judgement_requested: {
      type: 'boolean',
      defaultValue: false,
      label: 'judgement',
      optionLabels: ['Not requested', 'requested'],
      readOnly: true
    }
  },
  extendedByTable: 'argument_judgement',
  preview: (record: DataRecord) => ((record.isolated_confidence === null) ? '' : `(${getPercent(record.isolated_confidence as number)}) `) + record.title,
  aggregates: {
    critical_statements: {
      type: '1-n',
      table: 'critical_statement',
      column: 'argument_id',
      splitByColumn: 'critical_question_id',
      filterSplitBy: 'argument_type_id'
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
      fields: ['judgement_requested', 'judgements', 'conditionals']
    }
  }
}
