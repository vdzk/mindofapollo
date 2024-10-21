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
      },
      aggregates: {
        critical_questions: {
          type: '1-n',
          table: 'critical_question',
          column: 'argument_type_id'
        },
        argumens: {
          type: '1-n',
          table: 'argument',
          column: 'argument_type_id'
        }
      }
    },
    critical_question: {
      plural: 'critical questions',
      columns: {
        argument_type_id: {
          type: 'fk',
          fk: {
            table: 'argument_type',
            labelColumn: 'label'
          }
        },
        text: {
          type: 'varchar',
          preview: true
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
            labelColumn: 'text'
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
      },
      aggregates: {
        critical_statements: {
          type: '1-n',
          table: 'critical_statement',
          column: 'argument_id',
          splitByColumn: 'critical_question_id',
          filterSplitBy: 'argument_type_id'
        }
      }
    },
    critical_statement: {
      plural: 'critical statements',
      columns: {
        // TODO: Question should also be probably displayed
        argument_id: {
          type: 'fk',
          fk: {
            table: 'argument',
            labelColumn: 'text'
          }
        },
        critical_question_id: {
          type: 'fk',
          fk: {
            table: 'critical_question',
            labelColumn: 'text'
            // TODO: argument_type of the argument should match argument_type of the question
          }
        },
        text: {
          type: 'text',
          preview: true
        }
      }
    }
  }
}