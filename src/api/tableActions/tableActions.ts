"use server"

import { _updateRecord, safeWrap } from "../shared/mutate"
import { getRecordById } from "../shared/select"
import { hasArguments, hasUnjudgedArguments } from "~/api/tableActions/statement";
import { attemptJudgeStatement } from "~/api/shared/attemptJudgeStatement";
import { finishExpl, startExpl } from "~/server-only/expl";
import { ReqArgJudgeExpl } from "~/components/expl/actions/ReqArgJudge";
import { pickWithExplId } from "~/util";
import { _getCreatedCriticalStatement } from "./argument";


export type TableAction = (
  userId: number,
  recordId: number,
  execute: boolean
) => Promise<void | string | boolean>

const tableActions: Record<string, Record<string, TableAction>> = {
  argument: {
    requestJudgement: async (userId, recordId, execute) => {
      //TODO: if there was not activity for a period of time, qualify any signed in user to make the request
      const argument = await getRecordById('argument', recordId)
      if (!argument) return
      const statement = await getRecordById('statement', argument.statement_id as number)
      if (!statement || statement.argument_aggregation_type_id !== 'evidential') return
      const critical_statement = await _getCreatedCriticalStatement(userId, recordId)
      if (!critical_statement) return
      if (!execute) return 'Request judgement'
      const explId = await startExpl(
        userId, 'ReqArgJudge', 1, 'statement', recordId)
      const diff = await _updateRecord(
        'argument', recordId, explId, { judgement_requested: true })
      const data: ReqArgJudgeExpl = {
        argument: pickWithExplId(argument, ['title']),
        statement: pickWithExplId(statement, ['argument_aggregation_type_id']),
        critical_statement: pickWithExplId(critical_statement, ['id']),
        diff
      }
      await finishExpl(explId, data)
      return true
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
          await _updateRecord(userId, 'requestJudgement', 'statement', recordId, { judgement_requested: true })
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
        await _updateRecord(userId, 'requestAdditiveJudgement', 'statement', recordId, { judgement_requested: true })
      }
    }
  }
}

export const getVisibleActions = safeWrap(async (
  userId: number,
  tableName: string,
  recordId: number
) => {
  if (tableActions[tableName]) {
    const promises = Object.entries(tableActions[tableName]).map(
      async ([name, action]) => {
        const actionLabel = await action(userId, recordId, true)
        return actionLabel ? { name, label: actionLabel } : null
      }
    )
    const resolved = await Promise.all(promises)
    const filtered = resolved.filter(x => x !== null)
    return filtered
  } else {
    return []
  }
})

export const executeAction = safeWrap(async (
  userId: number,
  tableName: string,
  actionName: string,
  recordId: number
) => {
  const success = tableActions[tableName][actionName](userId, recordId, true)
  if (!success) {
    return 'This action is no longer available.'
  }
})

