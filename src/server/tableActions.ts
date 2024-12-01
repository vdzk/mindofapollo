"use server"

import { addedCriticalStatement } from "./judge"
import { updateRecord } from "./mutate.db"


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
        await updateRecord('argument', recordId, { judgement_requested: true})
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
        return visible ? {name, label: action.label} : null
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