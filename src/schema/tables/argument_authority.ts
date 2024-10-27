import { TableSchema } from "../type";

export const argument_authority: TableSchema = {
  extendsTable: 'argument',
  columns: {
    authority: {
      label: 'Why this is a relevant authority?',
      type: 'text'
    },
    quote: {
      type: 'text'
    },
    source_title: {
      label: 'source',
      type: 'link_title'
    },
    source_url: {
      label: 'source',
      type: 'link_url'
    }
  }
}