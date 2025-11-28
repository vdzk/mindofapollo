import { TableSchema } from "~/schema/type";
import { firstCap, truncate } from "~/utils/string";

export const definition: TableSchema = {
  plural: 'definitions',
  columns: {
    label: {
      type: 'virtual',
      getLocal: record => truncate(
        `${firstCap(record.term as string)} - ${record.text}`, 75
      )
    },
    term: {
      type: 'varchar'
    }, 
    text: {
      type: 'text',
      lines: 6
    }
  },
  aggregates: {
    definitions: {
      type: 'n-n',
      table: 'definition',
      first: true
    },
    used_in_definitions: {
      type: 'n-n',
      table: 'definition'
    },
    statements: {
      type: 'n-n',
      table: 'statement'
    },
    arguments: {
      type: 'n-n',
      table: 'argument'
    }
  },
  sections: {
    details: {
      label: 'details',
      fields: ['term', 'text']
    },
    definitions: {
      label: 'definitions',
      fields: ['definitions']
    },
    used_in: {
      label: "used in",
      fields: ['statements', 'arguments', 'used_in_definitions']
    }
  }
}