import { TbSword } from "solid-icons/tb";
import { DataRecord, TableSchema } from "../../schema/type";

export const argument: TableSchema = {
  plural: 'arguments',
  icon: TbSword,
  columns: {
    question_id: {
      type: 'fk',
      fk: {
        table: 'question',
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
        labelColumn: 'id',
        extensionTables: true
      }
    },
    judgement_requested: {
      type: 'boolean',
      readOnly: true,
      defaultValue: false,
      label: 'judgement',
      optionLabels: ['Not requested', 'requested']
    }
  },
  extendedByTable: 'argument_judgement',
  preview: (record: DataRecord) => record.title + ((record.isolated_confidence === null) ? '' : ` (${record.isolated_confidence})`),
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
  }
}
