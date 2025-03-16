import { WeightedArgument } from "~/compute";
import { onError, sql } from "~/server-only/db";
import { injectTranslations } from "./injectTranslations";
import { DataRecordWithId } from "~/schema/type";

export const getWeightedArguments = async (statementId: number): Promise<WeightedArgument[]> => {
  const results = await sql<DataRecordWithId[]>`
    SELECT argument.id, argument.pro, argument_weight.*
    FROM argument
    JOIN argument_weight
      ON argument_weight.id = argument.id
    WHERE argument.statement_id = ${statementId}   
  `.catch(onError)
  
  await injectTranslations('argument', results, ['title']);
  
  return results as WeightedArgument[]
}
