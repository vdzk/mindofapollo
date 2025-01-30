"use server"

import {_updateRecord, safeWrap, updateRecord} from "../shared/mutate"
import {getRecordById} from "../shared/select"
import {addedCriticalStatement} from "~/api/tableActions/argument";
import {hasArguments, hasUnjudgedArguments} from "~/api/tableActions/statement";
import {attemptJudgeStatement} from "~/api/shared/attemptJudgeStatement";
import { Id } from "~/types";


export interface TableAction {
  label: string,
  getVisibility: (recordId: Id) => Promise<boolean> | boolean
  execute: (userId: number, recordId: Id) => Promise<void>
}

const tableActions: Record<string, Record<string, TableAction>> = {
  argument: {
    requestJudgement: {
      label: 'Request judgement',
      getVisibility: async recordId => {
        //TODO: if there was not activity for a period of time, qualify any signed in user to make the request
        const argument = await getRecordById('argument', recordId)
        if (!argument) return false
        const statement = await getRecordById('statement', argument.statement_id as number)
        if (!statement || statement.argument_aggregation_type_id !== 'evidential') {
          return false
        }
        const qualify = await addedCriticalStatement(recordId)
        return qualify ?? false
      },
      execute: async (userId, recordId) => {
        await _updateRecord(userId, 'argument', recordId, { judgement_requested: true })
      }
    }
  },
  statement: {
    requestJudgement: {
      label: 'Request judgement',
      getVisibility: async recordId => {
        const record = await getRecordById('statement', recordId)
        return (
          !record?.judgement_requested
          && await hasArguments(recordId)
          && !(await hasUnjudgedArguments(recordId))
        ) ?? false
      },
      execute: async (userId, recordId) => {
        if (await attemptJudgeStatement(recordId)) {
          // success
        } else {
          await _updateRecord(userId, 'statement', recordId, { judgement_requested: true })
        }
      }
    },
    requestAdditiveJudgement: {
      label: 'Request judgement',
      getVisibility: async recordId => {
        const record = await getRecordById('statement', recordId)
        return !record?.judgement_requested && record?.argument_aggregation_type_id === 'additive'
      },
      execute: async (userId, recordId) => {
        await _updateRecord(userId, 'statement', recordId, { judgement_requested: true })
      }
    }
  }
}

export const getVisibleActions = async (
  tableName: string,
  recordId: Id
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

export const executeAction = safeWrap(async (
  userId: number,
  tableName: string,
  actionName: string,
  recordId: Id
) => {
  const action = tableActions[tableName][actionName]
  if (await action.getVisibility(recordId)) {
    await action.execute(userId, recordId)
  } else {
    return 'This action is no longer available.'
  }
})

