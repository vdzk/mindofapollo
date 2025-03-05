import { _updateRecord } from "~/server-only/mutate"
import { _getRecordById } from "~/server-only/select"
import { finishExpl, startExpl } from "~/server-only/expl"
import { getUserId, getUserActorUser } from "~/server-only/session"
import { ExplData, ExplDiff, UserActor } from "~/components/expl/types"
import { DataRecordWithId } from "~/schema/type"

export const askToJudgeAdditiveStatement = async (
  recordId: number,
  execute: boolean
) =>  {
  "use server"
  const userId = await getUserId()
  const statement = await _getRecordById('statement', recordId, ['judgement_requested', 'argument_aggregation_type_id', 'id', 'text'])
  if (!statement || statement?.judgement_requested) return
  const aggType = await _getRecordById('argument_aggregation_type', statement.argument_aggregation_type_id as number, ['name'])
  if (!aggType || aggType.name !== 'additive') return
  if (!execute) return 'Request judgement'
  
  const user = await getUserActorUser()
  const explId = await startExpl(userId, 'askToJudgeAdditiveStatement', 1, 'statement', recordId)
  const diff = await _updateRecord('statement', recordId, explId, { judgement_requested: true })
  const data: ExplSaveData = { user, statement, diff }
  await finishExpl(explId, data)
  return true
}

interface ExplSaveData {
  user: UserActor['user']
  statement: DataRecordWithId
  diff: ExplDiff<{judgement_requested: boolean}>
}

export const explAskToJudgeAdditiveStatement = (data: ExplSaveData): ExplData => ({
  actor: { type: 'user', user: data.user },
  action: 'asked to judge',
  target: {
    tableName: 'statement',
    id: data.statement.id,
    label: data.statement.text as string
  },
  diff: data.diff,
  relevantRecords: { statement: [data.statement] },
  checks: ["The argument aggregation type of the statement is 'additive'"]
})