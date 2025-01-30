import { DataRecord, TableSchema } from "~/schema/type";

export const presuasion_critique: TableSchema = {
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
          ? `(c: ${record.confidence}) ${record.text}`
          : record.text as string
      }
    }
  }
}
