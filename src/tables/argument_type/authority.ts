import { TableSchema } from "../../schema/type";

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
      type: 'link_title'
    },
    source_url: {
      label: 'source URL',
      type: 'link_url'
    }
  }
}
