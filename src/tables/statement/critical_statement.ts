import { DataRecord, TableSchema } from "../../schema/type"
import { getDescriptiveStatementLabel } from "./statement"

export const critical_statement: TableSchema = {
  plural: 'critical statements',
  columns: {
    label: {
      type: 'virtual',
      queries: {
        critical_statement: [
          ['id'],
          ['statement_id', [
            ['text'],
            ['decided'],
            ['confidence']
          ]]
        ]
      },
      get: (ids, results) => {
        const labels = Object.fromEntries(results.critical_statement.map(
          (record: DataRecord) => [ record.id, getDescriptiveStatementLabel(record)]
        ))
        return labels
      }
    },
    argument_id: {
      type: 'fk',
      fk: {
        table: 'argument',
        labelColumn: 'title'
      }
    },
    critical_question_id: {
      type: 'fk',
      fk: {
        table: 'critical_question',
        labelColumn: 'text'
        // TODO: argument_type of the argument should match argument_type of the question
      }
    },
    statement_id: {
      type: 'fk',
      fk: {
        table: 'statement',
        labelColumn: 'label'
      }
    }
  }
}
