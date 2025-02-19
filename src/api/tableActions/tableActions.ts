"use server"

import { _updateRecord } from "../../server-only/mutate"
import { _getRecordById } from "~/server-only/select"
import { attemptJudgeStatement } from "~/server-only/attemptJudgeStatement";
import { finishExpl, startExpl } from "~/server-only/expl";
import { ReqArgJudgeExpl } from "~/components/expl/actions/ReqArgJudge";
import { pickWithExplId } from "~/util";
import { ReqStatementJudgeExpl } from "~/components/expl/actions/ReqStatementJudge";
import { getUserSession } from "../../server-only/session";
import { _getCreatedCriticalStatement } from "~/server-only/argument";
import { hasArguments, hasUnjudgedArguments } from "~/server-only/statement";


export type TableAction = (
  userId: number,
  recordId: number,
  execute: boolean
) => Promise<void | string | boolean>

const tableActions: Record<string, Record<string, TableAction>> = {
  argument: {
    requestJudgement: async (userId, recordId, execute) => {
      //TODO: if there was not activity for a period of time, qualify any signed in user to make the request
      const argument = await _getRecordById('argument', recordId, ['judgement_requested', 'statement_id', 'title'])
      if (!argument || argument.judgement_requested) return
      const statement = await _getRecordById('statement', argument.statement_id as number, ['argument_aggregation_type_id'])
      if (!statement) return
      const aggType = await _getRecordById('argument_aggregation_type', statement.argument_aggregation_type_id as number, ['name'])
      if (!aggType || aggType.name !== 'evidential') return
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
    requestJudgement: async (userId, recordId, execute) => {
      const record = await _getRecordById('statement', recordId, ['id', 'text', 'argument_aggregation_type_id'])
      if (record && !record.judgement_requested
        && await hasArguments(recordId)
        && !(await hasUnjudgedArguments(recordId))
      ) {
        if (!execute) return 'Request judgement'
        const explId = await startExpl(userId, 'ReqStatementJudge', 1, 'statement', recordId)
        
        const judged_expl_id = await attemptJudgeStatement(
          recordId, explId, 'user requested judgement of the statement'
        )
        
        const data: ReqStatementJudgeExpl = {
          statement: pickWithExplId(record, ['id', 'text']),
          judged_expl_id
        }

        if (!judged_expl_id) {
          const diff = await _updateRecord('statement', recordId, userId, { judgement_requested: true })
          data.diff = diff
        }
        
        await finishExpl(explId, data)
        return true
      }
    },
    requestAdditiveJudgement: async (userId, recordId, execute) => {
      const record = await _getRecordById('statement', recordId, ['judgement_requested', 'argument_aggregation_type_id', 'id', 'text'])
      if (!record?.judgement_requested && record?.argument_aggregation_type_id === 'additive') {
        if (!execute) return 'Request judgement'
        const explId = await startExpl(userId, 'ReqAdditiveJudge', 1, 'statement', recordId)
        const diff = await _updateRecord('statement', recordId, userId, { judgement_requested: true })
        await finishExpl(explId, { statement: pickWithExplId(record, ['id', 'text']), diff })
        return true
      }
    }
  }
}

export const getVisibleActions = async (
  tableName: string,
  recordId: number
) => {
  const userSession = await getUserSession()
  if (tableActions[tableName]) {
    const promises = Object.entries(tableActions[tableName]).map(
      async ([name, action]) => {
        const actionLabel = await action(userSession.userId, recordId, false)
        return actionLabel ? { name, label: actionLabel as string } : null
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
  const userSession = await getUserSession()
  const success = await tableActions[tableName][actionName](userSession.userId, recordId, true)
  if (!success) {
    return 'This action is no longer available.'
  }
}

