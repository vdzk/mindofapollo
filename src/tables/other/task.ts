import { TableSchema } from "~/schema/type";

export const inProgressStatus = 'in progress'
export const nextUpStatus = 'next up'

export const task: TableSchema = {
  plural: 'tasks',
  extendsTable: 'issue',
  columns: {
    status: {
      type: 'option',
      options: [
        'backlog',
        nextUpStatus,
        inProgressStatus,
        'completed',
        'on hold',
        'cancelled'
      ],
      defaultValue: 'backlog'
    },
    project_stage: {
      type: 'option',
      options: [
        'closed β rel.',
        'codebase rel.',
        'open β rel.',
        'launch',
        'maintenance'
      ]
    },
    functional_area: {
      type: 'option',
      options: [
        'perf.',
        'auth',
        'DB',
        'content',
        'UX',
        'DX',
        'i18n',
        'audit',
        'reasoning',
        'testing',
        'unknown'
      ]
    }
  }
}