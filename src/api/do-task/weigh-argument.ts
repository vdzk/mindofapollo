"use server"

import { calcStatementConfidenceAdditively } from "~/compute";
import { sql } from "../../db";
import { safeWrap, updateRecord } from "../shared/mutate";

const getWeightedArguments = (statementId: number) => sql`
  SELECT *
  FROM argument
  JOIN argument_weight
    ON argument_weight.id = argument.id
  WHERE argument.statement_id = ${statementId}   
`

export const getWeighArgumentTaskData = safeWrap(async (userId) => {
  const [argument] = await sql`
    SELECT a.*
    FROM argument a
    JOIN statement s ON a.statement_id = s.id
    WHERE s.argument_aggregation_type_id = 'additive'
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
  const weightedArguments = await getWeightedArguments(argument.statement_id)
  return { argument, weightedArguments }
})

export const attemptAggregateArguments = safeWrap(async (
  userId,
  statementId: number
) => {
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
})
