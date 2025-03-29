import { TableSchema } from "~/schema/type";
import { getPercent } from "~/utils/string";

export const argument_judgement: TableSchema = {
  extendsTable: 'argument',
  plural: 'argument judgements',
  columns: {
    label: {
      type: 'virtual',
      queries: {
        arguments: [
          ['id', [
            ['title']
          ]],
          ['isolated_confidence']
        ]
      },
      get: (ids, results) => Object.fromEntries(results.arguments.map(record =>
        [record.id, `${record.title} (${getPercent(record.isolated_confidence as number)})`]
      ))
    },
    dismissal_explanation: {
      type: 'text',
      lines: 2,
      defaultValue: '',
    },
    isolated_confidence: {
      type: 'proportion',
      label: 'confidence'
    },
    isolated_explanation: {
      type: 'text',
      lines: 4,
      label: 'explanation'
    }
  }
}