import { WeightedArgument } from "~/compute";
import { sql } from "~/server-only/db";


export const getWeightedArguments = (statementId: number): Promise<WeightedArgument[]> => sql`
  SELECT argument.pro, argument_weight.*
  FROM argument
  JOIN argument_weight
    ON argument_weight.id = argument.id
  WHERE argument.statement_id = ${statementId}   
`;
