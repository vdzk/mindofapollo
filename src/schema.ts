export interface SimpleColumn {
  type: 'integer' | 'varchar' | 'text', //subset of pg data types
  label?: string,
  preview?: boolean //Use this column to represent the whole record
}

export interface BooleanColumn {
  type: 'boolean',
  label?: string
  optionLabels?: [string, string]
}

export interface ForeignKey {
  type: 'fk',
  label?: string,
  fk: {
    table: string,
    labelColumn: string
    parent?: boolean
  }
}

export type ColumnSchema = SimpleColumn | BooleanColumn | ForeignKey

export interface AggregateSchema {
  table: string;
  column: string;
}

export interface TableSchema {
  plural: string,
  defaultView?: 'list'
  columns: Record<string, ColumnSchema>,
  aggreagates?: Record<string, AggregateSchema>,
}

interface AppDataSchema {
  tables: Record<string, TableSchema>
}

export const schema: AppDataSchema = {
  tables: {
    person: {
      plural: 'persons',
      columns: {
        name: {
          type: 'varchar'
        },
        email: {
          type: 'varchar'
        },
        password: {
          type: 'varchar'
        },
      }
    },
    question: {
      plural: 'questions',
      columns: {
        text: {
          type: 'varchar'
        }
      },
      aggreagates: {
        arguments: {
          table: 'argument',
          column: 'question_id'
        }
      }
    },
    argument_type: {
      plural: 'argument types',
      columns: {
        label: {
          type: 'varchar'
        }
      }
    },
    argument: {
      plural: 'arguments',
      columns: {
        question_id: {
          type: 'fk',
          fk: {
            table: 'question',
            labelColumn: 'text',
            parent: true
          }
        },
        pro: {
          type: 'boolean',
          label: 'side',
          optionLabels: ['Con', 'Pro']
        },
        text: {
          type: 'text',
          preview: true
        },
        argument_type_id: {
          type: 'fk',
          fk: {
            table: 'argument_type',
            labelColumn: 'label'
          }
        }
      }
    }
  }
}