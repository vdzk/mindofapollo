"use server"

import { sql } from "~/server-only/db"
import { getWeightedArguments } from "../../server-only/getWeightedArguments"

export const getTaskWeighArgument = async () => {
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

