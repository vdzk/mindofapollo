import { DataRecord, TableSchema } from "~/schema/type";
import { getPercent } from "~/utils/string";

export const persuasion_critique: TableSchema = {
  plural: 'persuasion critiques',
  columns: {
    moral_persuasion_id: {
      type: 'fk',
      fk: {
        table: 'moral_persuasion',
        labelColumn: 'title'
      }
    },
    statement_id: {
      type: 'fk',
      label: 'statement',
      preview: true,
      fk: {
        table: 'statement',
        labelColumn: 'text',
        getLabel: (record: DataRecord) => record.decided
          ? `(${getPercent(record.confidence as number)}) ${record.text}`
          : record.text as string
      }
    }
  }
}
