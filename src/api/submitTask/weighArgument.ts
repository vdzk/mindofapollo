import { sql } from "~/server-only/db"
import { _insertRecord, _updateRecord } from "~/server-only/mutate"
import { startExpl, finishExpl } from "~/server-only/expl"
import { getUserSession, getUserActorUser } from "~/server-only/session"
import { DataRecord, DataRecordWithId } from "~/schema/type"
import { calcStatementConfidenceAdditively, WeightedArgument } from "~/compute"
import { _getRecordById } from "~/server-only/select"
import { getWeightedArguments } from "~/server-only/getWeightedArguments"
import { ExplData, UserActor } from "~/components/expl/types"

export const submitTaskWeighArgument = async (
  argumentId: number,
  weightData: DataRecord
) => {
  "use server"
  const argument = await _getRecordById('argument', argumentId, ['id', 'statement_id'])
  if (!argument) return
  const statement = await _getRecordById('statement', argument.statement_id as number, ['id', 'text'])
  if (!statement) return

  const userSession = await getUserSession()
  const user = await getUserActorUser()
  const explId = await startExpl(userSession.userId, 'submitTaskWeighArgument', 1, 'argument', argumentId)
  const argumentWeight = await _insertRecord("argument_weight", {id: argumentId, ...weightData}, explId)
  await finishExpl(explId, {
    weightData,
    argument,
    statement,
    argumentWeight,
    user
  })
  
  if (argument.statement_id) {
    await attemptAggregateArguments(statement)
  }
  
  return true
}

interface ExplWeighArgumentData {
  weightData: DataRecord
  argument: DataRecordWithId
  statement: DataRecordWithId
  argumentWeight: DataRecordWithId
  user: UserActor['user']
}

export const explSubmitTaskWeighArgument = (data: ExplWeighArgumentData): ExplData => {
  return {
    actor: { type: 'user', user: data.user },
    action: 'weighed argument',
    target: {
      tableName: 'argument',
      id: data.argument.id,
      label: data.argument.title as string
    },
    insertedRecords: {
      argument_weight: [data.argumentWeight]
    },
    relevantRecords: {
      argument: [data.argument],
      statement: [data.statement]
    }
  }
}

const attemptAggregateArguments = async (
  statement: DataRecordWithId
) => {
  const userSession = await getUserSession()
  const checkResults = await sql`
    SELECT NOT EXISTS (
      SELECT 1
      FROM argument a
      WHERE a.statement_id = ${statement.id}
        AND NOT EXISTS (
          SELECT 1
          FROM argument_weight aw
          WHERE aw.id = a.id
        )
  ) AS all_arguments_have_weights
  `
  if (!checkResults[0].all_arguments_have_weights) return
  const weightedArguments = await getWeightedArguments(statement.id)
  if (!weightedArguments) return
  const confidence = calcStatementConfidenceAdditively(weightedArguments as any)
  const explId = await startExpl(userSession.userId, 'attemptAggregateArguments', 1, 'statement', statement.id)
  const diff = await _updateRecord('statement', statement.id, explId, {
    judgement_requested: false,
    confidence,
    decided: true
  })
  await finishExpl(explId, {
    statement,
    weightedArguments: weightedArguments as unknown as DataRecord[],
    diff
  })
}

interface ExplAggregateArgumentsData {
  statement: DataRecordWithId
  weightedArguments: DataRecord[]
  diff: ExplData['diff']
}

export const explAttemptAggregateArguments = (data: ExplAggregateArgumentsData): ExplData => {
  return {
    actor: { type: 'system' },
    action: 'aggregated argument weights for',
    target: {
      tableName: 'statement',
      id: data.statement.id,
      label: data.statement.text as string
    },
    diff: data.diff,
    relevantRecords: {
      argument_weight: data.weightedArguments,
      statement: [data.statement]
    }
  }
}