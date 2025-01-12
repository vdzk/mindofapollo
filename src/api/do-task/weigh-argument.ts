"use server"

import { calcQuestionConfidenceAdditively, WeightedArgument } from "~/compute";
import { sql } from "../../db";
import { safeWrap, updateRecord } from "../shared/mutate";

const getWeightedArguments = (questionId: number) => sql`
  SELECT *
  FROM argument
  JOIN argument_weight
    ON argument_weight.id = argument.id
  WHERE argument.question_id = ${questionId}   
`

export const getWeighArgumentTaskData = safeWrap(async (userId) => {
  const [argument] = await sql`
    SELECT a.*
    FROM argument a
    JOIN question q ON a.question_id = q.id
    WHERE q.argument_aggregation_type_id = 'additive'
      AND q.judgement_requested = true
      AND NOT EXISTS (
        SELECT 1
        FROM argument_weight aw
        WHERE aw.id = a.id
      )
    ORDER BY RANDOM()
    LIMIT 1
  `
  if (!argument) return
  const weightedArguments = await getWeightedArguments(argument.question_id)
  return { argument, weightedArguments }
})

export const attemptAggregateArguments = safeWrap(async (
  userId,
  questionId: number
) => {
  const checkResults = await sql`
    SELECT NOT EXISTS (
      SELECT 1
      FROM argument a
      WHERE a.question_id = ${questionId}
        AND NOT EXISTS (
          SELECT 1
          FROM argument_weight aw
          WHERE aw.id = a.id
        )
  ) AS all_arguments_have_weights
  `
  if (!checkResults[0].all_arguments_have_weights) return
  const weightedArguments = await getWeightedArguments(questionId)
  const confidence = calcQuestionConfidenceAdditively(weightedArguments as any)
  await updateRecord("question", questionId, {
    judgement_requested: false,
    confidence,
    decided: true
  })
})
