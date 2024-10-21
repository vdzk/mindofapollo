import { AppDataSchema } from "./schema.type"

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
    tag: {
      plural: 'tags',
      columns: {
        name: {
          type: 'varchar'
        }
      },
      aggregates: {
        questions: {
          type: 'n-n',
          table: 'question'
        }
      }
    },
    question: {
      plural: 'questions',
      columns: {
        text: {
          type: 'varchar'
        }
      },
      aggregates: {
        arguments: {
          type: '1-n',
          table: 'argument',
          column: 'question_id',
          splitByColumn: 'pro'
        },
        tags: {
          type: 'n-n',
          table: 'tag',
          first: true
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