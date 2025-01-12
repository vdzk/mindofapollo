"use server"

import {updateRecord} from "../shared/mutate"
import {getRecordById} from "../shared/select"
import {addedCriticalStatement} from "~/api/tableActions/argument";
import {hasArguments, hasUnjudgedArguments} from "~/api/tableActions/question";
import {attemptJudgeQuestion} from "~/api/shared/attemptJudgeQuestion";
import {action, cache, json} from "@solidjs/router";


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
        const argument = await getRecordById('argument', recordId)
        if (!argument) return false
        const question = await getRecordById('question', argument.question_id as number)
        if (!question || question.argument_aggregation_type_id !== 'evidential') {
          return false
        }
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
    },
    requestAdditiveJudgement: {
      label: 'Request judgement',
      getVisibility: async recordId => {
        const record = await getRecordById('question', recordId)
        return !record?.judgement_requested && record?.argument_aggregation_type_id === 'additive'
      },
      execute: async recordId => {
        await updateRecord('question', recordId, { judgement_requested: true })
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

export const getVisibleActionsCache = cache(getVisibleActions, 'getVisibleActions')

export const executeTableAction = action(
    async (
        tableName: string,
        actionName: string,
        recordId: number
    ) => {
      const error = await executeAction(tableName, actionName, recordId)
      if (error) {
        return error
      } else {
        return json(
            undefined,
            {
              revalidate: [
                getVisibleActionsCache.keyFor(tableName, recordId)
              ]
            }
        )
      }
    }
)
