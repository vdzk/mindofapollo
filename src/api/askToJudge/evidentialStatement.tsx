import { _updateRecord } from "~/server-only/mutate"
import { _getRecordById } from "~/server-only/select"
import { finishExpl, startExpl } from "~/server-only/expl"
import { hasArguments, hasUnjudgedArguments } from "~/server-only/statement"
import { attemptJudgeStatement } from "~/server-only/attemptJudgeStatement"
import { getUserId } from "~/server-only/session"
import { ExplData, ExplDiff, UserActor } from "~/components/expl/types"
import { DataRecordWithId } from "~/schema/type"
import { ExplLink } from "~/components/expl/ExplLink"

export const askToJudgeEvidentialStatement = async (
  recordId: number,
  execute: boolean
) => {
  "use server"
  const userId = await getUserId()
  const user = await _getRecordById('person', userId, ['id', 'name', 'auth_role'], false) as UserActor['user']
  const statement = await _getRecordById('statement', recordId, ['id', 'text', 'argument_aggregation_type_id'])
  if (statement && !statement.judgement_requested
    && await hasArguments(recordId)
    && !(await hasUnjudgedArguments(recordId))
  ) {
    if (!execute) return 'Request judgement'
    const explId = await startExpl(userId, 'askToJudgeEvidentialStatement', 1, 'statement', recordId)

    const judged_expl_id = await attemptJudgeStatement(
      recordId, explId, 'user requested judgement of the statement'
    )

    const data: ExplSaveData = {
      user,
      statement,
      judged_expl_id
    }

    if (!judged_expl_id) {
      const diff = await _updateRecord('statement', recordId, explId, { judgement_requested: true })
      data.diff = diff
    }

    await finishExpl(explId, data)
    return true
  }
}

interface ExplSaveData {
  user: UserActor['user']
  statement: DataRecordWithId
  judged_expl_id?: number
  diff?: ExplDiff<{ judgement_requested: boolean }>
}

export const explAskToJudgeEvidentialStatement = (data: ExplSaveData): ExplData => ({
  actor: { type: 'user', user: data.user },
  action: 'asked to judge',
  target: {
    tableName: 'statement',
    id: data.statement.id,
    label: data.statement.text as string
  },
  diff: data.diff,
  relevantRecords: { statement: [data.statement] },
  checks: [
    'The statement has at least one argument',
    'All arguments have been judged'
  ],
  notes: [
    data.judged_expl_id
      ? <>
        The statement was judged automatically <ExplLink explId={data.judged_expl_id} />.
      </>
      : 'Arguments still need to be checked for correlations before the statement can be judged.'
  ]
})