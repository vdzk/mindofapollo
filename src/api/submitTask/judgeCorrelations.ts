import { DataRecord, DataRecordWithId } from "~/schema/type"
import { _insertRecordsOneByOne } from "~/server-only/mutate"
import { attemptJudgeStatement } from "~/server-only/attemptJudgeStatement"
import { startExpl, finishExpl } from "~/server-only/expl"
import { getUserId, getUserActorUser } from "~/server-only/session"
import { _getRecordById } from "~/server-only/select"
import { ExplData, UserActor } from "~/components/expl/types"

export const submitTaskJudgeCorrelations = async (statementId: number, records: DataRecord[]) => {
  "use server"
  const userId = await getUserId()
  const explId = await startExpl(userId, 'submitTaskJudgeCorrelations', 1, 'statement', statementId)
  const argumentConditionals = await _insertRecordsOneByOne('argument_conditional', records, explId)
  await attemptJudgeStatement(statementId, explId, 'user submitted correlations')
  
  const statement = await _getRecordById('statement', statementId, ['id', 'text'])
  if (!statement) return
  const user = await getUserActorUser()
  const data: ExplSaveData = {
    user,
    statement,
    argumentConditionals
  }
  await finishExpl(explId, data)
}

interface ExplSaveData {
  user: UserActor['user']
  statement: DataRecordWithId
  argumentConditionals: DataRecordWithId[]
}

export const explSubmitTaskJudgeCorrelations = (data: ExplSaveData): ExplData => {
  return {
    actor: { type: 'user', user: data.user },
    action: 'judged correlations for',
    target: {
      tableName: 'statement',
      id: data.statement.id,
      label: data.statement.text as string
    },
    insertedRecords: {
      argument_conditional: data.argumentConditionals
    },
    relevantRecords: {
      statement: [data.statement]
    }
  }
}