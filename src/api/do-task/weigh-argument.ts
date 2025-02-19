"use server"

import { sql } from "../../server-only/db"
import { _insertRecord, _updateRecord, updateRecord } from "../shared/mutate"
import { getRecordById } from "../shared/select"
import { startExpl } from "../../server-only/expl"
import { getUserSession } from "../shared/session"
import { DataRecord } from "~/schema/type"
import { calcStatementConfidenceAdditively } from "~/compute"

const getWeightedArguments = (statementId: number) => sql`
  SELECT *
  FROM argument
  JOIN argument_weight
    ON argument_weight.id = argument.id
  WHERE argument.statement_id = ${statementId}   
`

export const getWeighArgumentTaskData = async () => {
  const userSession = await getUserSession()
  const [argument] = await sql`
    SELECT a.*
    FROM argument a
    JOIN statement s ON a.statement_id = s.id
    JOIN argument_aggregation_type aat ON aat.id = s.argument_aggregation_type_id
    WHERE aat.name = 'additive'
      AND s.judgement_requested = true
      AND NOT EXISTS (
        SELECT 1
        FROM argument_weight aw
        WHERE aw.id = a.id
      )
    ORDER BY RANDOM()
    LIMIT 1
  `
  if (!argument) return
  const weightedArguments = await getWeightedArguments(argument.statement_id as number)
  return { argument, weightedArguments }
}

export const attemptAggregateArguments = async (
  statementId: number
) => {
  const userSession = await getUserSession()
  const checkResults = await sql`
    SELECT NOT EXISTS (
      SELECT 1
      FROM argument a
      WHERE a.statement_id = ${statementId}
        AND NOT EXISTS (
          SELECT 1
          FROM argument_weight aw
          WHERE aw.id = a.id
        )
  ) AS all_arguments_have_weights
  `
  if (!checkResults[0].all_arguments_have_weights) return
  const weightedArguments = await getWeightedArguments(statementId)
  const confidence = calcStatementConfidenceAdditively(weightedArguments as any)
  await updateRecord("statement", statementId, {
    judgement_requested: false,
    confidence,
    decided: true
  })
}

export const submitArgumentWeight = async (
  argumentId: number,
  weightData: DataRecord
) => {
  const argument = await getRecordById('argument', argumentId)
  if (!argument) return

  const userSession = await getUserSession()
  const explId = await startExpl(userSession.userId, 'WeighArgument', 1, 'argument', argumentId)
  await _insertRecord("argument_weight", {id: argumentId, ...weightData}, explId)
  
  if (argument.statement_id) {
    await attemptAggregateArguments(argument.statement_id as number)
  }
  
  return true
}
