export interface ForeignKey {
  type: 'fk',
  label?: string,
  fk: {
    table: string,
    labelColumn: string
  }
}

export interface TableSchema {
  title?: string,
  defaultView?: 'list'
  columns: Record<string, {
    type: 'integer' | 'varchar' | 'text' | 'boolean',
    label?: string
  } | ForeignKey>
}

interface AppDataSchema {
  tables: Record<string, TableSchema>
}

export const schema: AppDataSchema = {
  tables: {
    person: {
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
      title: 'Questions',
      columns: {
        text: {
          type: 'varchar',
          label: 'Question'
        }
      }
    },
    argument_type: {
      title: 'Argument Types',
      columns: {
        label: {
          type: 'varchar'
        }
      }
    },
    argument: {
      columns: {
        text: {
          type: 'text'
        },
        pro: {
          type: 'boolean'
        },
        question_id: {
          type: 'fk',
          fk: {
            table: 'question',
            labelColumn: 'text'
          }
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