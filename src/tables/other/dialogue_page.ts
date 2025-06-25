import { ChatFragmentHost } from "~/api/getOne/dialoguePage"
import { TableSchema } from "~/schema/type"

export interface DialogueFragment {
  record_id: number
  table_name: ChatFragmentHost
}

export interface DialogueMessage {
  pro: boolean
  fragments: DialogueFragment[]
}

export const dialogue_page: TableSchema = {
  plural: 'dialogue messages',
  columns: {
    statement_id: {
      type: 'fk',
      fk: {
        table: 'statement',
        labelColumn: 'label',
      }
    },
    title: {
      type: 'text',
      preview: true,
      lines: 3,
    },
    messages: {
      type: 'jsonb'
    }
  }
}