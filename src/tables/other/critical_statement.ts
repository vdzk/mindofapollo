import { schema } from "~/schema/schema"
import { DataRecord, TableSchema, VirtualColumnLocal } from "../../schema/type"

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
        ],
        // critical_statement: sqlStr`
        //   SELECT cs.id, statement.text
        //   FROM critical_statement AS cs
        //   JOIN statement ON cs.statement_id = statement.id
        //   WHERE cs.id = ANY($1::integer[])
        // `
      },
      get: (ids, results) => {
        const labels = Object.fromEntries(results.critical_statement.map(
          (record: DataRecord) => [
            record.id,
            (schema.tables.statement.columns.label as VirtualColumnLocal).getLocal(record)
          ]
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
        labelColumn: 'text',
        getLabel: (record: DataRecord) => record.decided
          ? `(c: ${record.confidence}) ${record.text}`
          : record.text as string
      }
    }
  }
}
