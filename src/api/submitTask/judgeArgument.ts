import { DataRecord, DataRecordWithId } from "~/schema/type"
import {_insertRecord, _updateRecord} from "~/server-only/mutate"
import { finishExpl, startExpl } from "~/server-only/expl"
import { _getRecordById } from "~/server-only/select"
import { getUserActorUser, getUserSession } from "~/server-only/session"
import { ExplData, ExplDiff, UserActor } from "~/components/expl/types"

export const submitTaskJudgeArgument = async (id: number, record: DataRecord) => {
  "use server"
  const userSession = await getUserSession()
  const argument = await _getRecordById('argument', id, ['id', 'title', 'statement_id'])
  if (!argument) return
  const statement = await _getRecordById('statement', argument.statement_id as number, ['id', 'text'])
  if (!statement) return
  const explId = await startExpl(userSession.userId, 'submitTaskJudgeArgument', 1, 'argument', id)
  await _insertRecord("argument_judgement", {id, ...record}, explId)
  const diff = await _updateRecord('argument', id, explId, {judgement_requested: false})
  const user = await getUserActorUser()
  const data: ExplSaveData = {
    user,
    argument,
    statement,
    insert: {argument_judgement: record},
    diff
  }
  await finishExpl(explId, data)
}

interface ExplSaveData {
  user: UserActor['user']
  argument: DataRecordWithId
  statement: DataRecordWithId
  insert: { argument_judgement: DataRecord }
  diff: ExplDiff<DataRecord>
}

export const explSubmitTaskJudgeArgument = (data: ExplSaveData): ExplData => {
  return {
    actor: { type: 'user', user: data.user },
    action: 'judged',
    target: {
      tableName: 'argument',
      id: data.argument.id,
      label: data.argument.title as string
    },
    diff: data.diff,
    insertedRecords: {
      argument_judgement: [{
        id: data.argument.id,
        ...data.insert.argument_judgement
      }]
    },
    relevantRecords: {
      argument: [data.argument],
      statement: [data.statement]
    },
    checks: [
      'The argument was not created by the user themself',
      'The argument was in the pool of arguments pending judgment',
      'The argument was randomly selected from the pending pool to ensure fair processing order'
    ]
  }
}