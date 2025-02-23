import { _updateRecord } from "~/server-only/mutate"
import { _getRecordById } from "~/server-only/select"
import { finishExpl, startExpl } from "~/server-only/expl"
import { _getCreatedCriticalStatement } from "~/server-only/argument"
import { ExplData, ExplDiff, UserActor } from "~/components/expl/types"
import { DataRecordWithId } from "~/schema/type"
import { getUserId } from "~/server-only/session"
import { ExplLink } from "~/components/expl/ExplLink"

export const askToJudgeArgument = async (
  recordId: number,
  execute: boolean
) => {
  "use server"
  const userId = await getUserId()
  const argument = await _getRecordById('argument', recordId, ['judgement_requested', 'statement_id', 'title'])
  if (!argument || argument.judgement_requested) return
  const statement = await _getRecordById('statement', argument.statement_id as number, ['argument_aggregation_type_id'])
  if (!statement) return
  const aggType = await _getRecordById('argument_aggregation_type', statement.argument_aggregation_type_id as number, ['name'])
  if (!aggType || aggType.name !== 'evidential') return
  const criticalStatement = await _getCreatedCriticalStatement(userId, recordId)
  if (!criticalStatement) return
  if (!execute) return 'Request judgement'
  const user = await _getRecordById('person', userId, ['id', 'name', 'auth_role'], false) as UserActor['user']
  const explId = await startExpl(userId, 'askToJudgeArgument', 1, 'statement', recordId)
  const diff = await _updateRecord('argument', recordId, explId, { judgement_requested: true })
  const data: ExplSaveData = {
    user,
    argument,
    statement,
    criticalStatement,
    diff
  }
  await finishExpl(explId, data)
  return true
}

interface ExplSaveData {
  user: UserActor['user']
  argument: DataRecordWithId
  statement: DataRecordWithId
  criticalStatement: DataRecordWithId
  diff: ExplDiff<{ judgement_requested: boolean }>
}

export const explAskToJudgeArgument = (data: ExplSaveData): ExplData => ({
  actor: { type: 'user', user: data.user },
  action: 'asked to judge',
  target: {
    tableName: 'argument',
    id: data.argument.id,
    label: data.argument.title as string
  },
  diff: data.diff,
  relevantRecords: {
    argument: [data.argument],
    statement: [data.statement],
    critical_statement: [data.criticalStatement]
  },
  checks: [
    <>
      Arguments for/against the target statment are evidential{' '}
      <ExplLink explId={data.statement.argument_aggregation_type_id_expl_id as number} />
      , so initially they can be assesed independently of each other.
    </>,
    <>
      The user has added a critical statement against the argument{' '}
      <ExplLink explId={data.criticalStatement.id_expl_id as number} />.{' '}
      <br />Hence the user is less likely to be very biased for the argument.
      <br />Hence it's less likely that the user was trying to protect the argument against criticism by requesting judgement before others had a chance to criticise it.
    </>
  ]
})