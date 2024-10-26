import { AppDataSchema } from "./schema.type"
import { ImPriceTag } from 'solid-icons/im'
import { IoPersonSharp } from 'solid-icons/io'
import { TbSword } from 'solid-icons/tb'
import { TbChess } from 'solid-icons/tb'
import { RiCommunicationQuestionnaireFill } from 'solid-icons/ri'
import { ImQuestion } from 'solid-icons/im'
import { BsExclamationDiamondFill } from 'solid-icons/bs'

export const schema: AppDataSchema = {
  tables: {
    person: {
      plural: 'persons',
      icon: IoPersonSharp,
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
      icon: ImPriceTag,
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
      icon: RiCommunicationQuestionnaireFill,
      columns: {
        text: {
          type: 'varchar'
        },
        answer: {
          type: 'varchar'
        },
        confidence: {
          type: 'proportion'
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
      icon: TbChess,
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
      icon: ImQuestion,
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
      icon: TbSword,
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
      icon: BsExclamationDiamondFill,
      columns: {
        question_id: {
          type: 'fk',
          readOnly: true,
          fk: {
            table: 'question',
            labelColumn: 'text'
          }
        },
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
        question_answer_id: {
          name: 'question_id',
          type: 'fk',
          label: 'statement',
          preview: true,
          fk: {
            table: 'question',
            labelColumn: 'answer'
          }
        },
      }
    }
  }
}