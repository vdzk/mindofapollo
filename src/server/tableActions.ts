"use server"

import { addedCriticalStatement, hasArguments, hasUnjudgedArguments, attemptJudgeQuestion } from "./judge"
import { updateRecord } from "./mutate.db"
import { getRecordById } from "./select.db"


export interface TableAction {
  label: string,
  getVisibility: (recordId: number) => Promise<boolean> | boolean
  execute: (recordId: number) => Promise<void>
}

const tableActions: Record<string, Record<string, TableAction>> = {
  argument: {
    requestJudgement: {
      label: 'Request judgement',
      getVisibility: async recordId => {
        //TODO: if there was not activity for a period of time, qualify any signed in user to make the request
        const qualify = await addedCriticalStatement(recordId)
        return qualify ?? false
      },
      execute: async recordId => {
        await updateRecord('argument', recordId, { judgement_requested: true })
      }
    }
  },
  question: {
    requestJudgement: {
      label: 'Request judgement',
      getVisibility: async recordId => {
        const record = await getRecordById('question', recordId)
        return (
          !record?.judgement_requested
          && await hasArguments(recordId)
          && !(await hasUnjudgedArguments(recordId))
        ) ?? false
      },
      execute: async recordId => {
        if (await attemptJudgeQuestion(recordId)) {
          // success
        } else {
          await updateRecord('question', recordId, { judgement_requested: true })
        }
      }
    }
  }
}

export const getVisibleActions = async (
  tableName: string,
  recordId: number
) => {
  if (tableActions[tableName]) {
    const promises = Object.entries(tableActions[tableName]).map(
      async ([name, action]) => {
        const visible = await action.getVisibility(recordId)
        return visible ? { name, label: action.label } : null
      }
    )
    const resolved = await Promise.all(promises)
    const filtered = resolved.filter(x => x !== null)
    return filtered
  } else {
    return []
  }
}

export const executeAction = async (
  tableName: string,
  actionName: string,
  recordId: number
) => {
  const action = tableActions[tableName][actionName]
  if (await action.getVisibility(recordId)) {
    await action.execute(recordId)
  } else {
    return 'This action is no longer available.'
  }
}