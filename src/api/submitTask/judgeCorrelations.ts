import { DataRecord, DataRecordWithId } from "~/schema/type"
import { _insertRecordsOneByOne } from "~/server-only/mutate"
import { attemptJudgeStatement } from "~/server-only/attemptJudgeStatement"
import { startExpl, finishExpl } from "~/server-only/expl"
import { getUserId, getUserActorUser } from "~/server-only/session"
import { _getRecordById } from "~/server-only/select"
import { ExplData, UserActor } from "~/components/expl/types"
import { sql, onError } from "~/server-only/db"
import { injectTranslations } from "~/server-only/injectTranslations"

export const submitTaskJudgeCorrelations = async (statementId: number, records: DataRecord[]) => {
  "use server"
  // TODO: ensure that statement and argument ids matches the ones that were in the user's task
  const userId = await getUserId()
  const explId = await startExpl(userId, 'submitTaskJudgeCorrelations', 1, 'statement', statementId)
  const argumentConditionals = await _insertRecordsOneByOne('argument_conditional', records, explId)
  await attemptJudgeStatement(statementId, explId, 'user submitted correlations')
  
  const statement = await _getRecordById('statement', statementId, ['id', 'text'])
  if (!statement) return
  
  const statementArguments = await sql`
    SELECT *
    FROM argument
    WHERE statement_id = ${statementId}
  `.catch(onError) as DataRecordWithId[]
  
  await injectTranslations('argument', statementArguments)
  
  const user = await getUserActorUser()
  const data: ExplSaveData = {
    user,
    statement,
    argumentConditionals,
    statementArguments
  }
  await finishExpl(explId, data)
}

interface ExplSaveData {
  user: UserActor['user']
  statement: DataRecordWithId
  argumentConditionals: DataRecordWithId[]
  statementArguments: DataRecordWithId[]
}

export const explSubmitTaskJudgeCorrelations = (data: ExplSaveData): ExplData => {
  return {
    actor: { type: 'user', user: data.user },
    action: 'judged argument correlations for',
    target: {
      tableName: 'statement',
      id: data.statement.id,
      label: data.statement.text as string
    },
    insertedRecords: {
      argument_conditional: data.argumentConditionals
    },
    relevantRecords: {
      statement: [data.statement],
      argument: data.statementArguments
    }
  }
}