import { TbSword } from "solid-icons/tb";
import { TableSchema } from "../type";

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
    }
  },
  aggregates: {
    critical_statements: {
      type: '1-n',
      table: 'critical_statement',
      column: 'argument_id',
      splitByColumn: 'critical_question_id',
      filterSplitBy: 'argument_type_id'
    }
  },
  initialData: [
    /*1*/[1, true, 'Both are yellow and round.', 'analogy']
  ]
}