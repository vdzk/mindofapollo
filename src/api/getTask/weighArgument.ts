import { onError, sql } from "~/server-only/db"
import { getWeightedArguments } from "../../server-only/getWeightedArguments"
import { injectTranslations } from "~/server-only/injectTranslations"
import { DataRecordWithId } from "~/schema/type"

export const getTaskWeighArgument = async () => {
  "use server"
  const [argument] = await sql<DataRecordWithId[]>`
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
  `.catch(onError)
  
  if (!argument) return
  await injectTranslations('argument', [argument])
  
  const weightedArguments = await getWeightedArguments(argument.statement_id as number)
  return { argument, weightedArguments }
}

