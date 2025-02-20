import { sql } from "~/server-only/db";


export const getWeightedArguments = (statementId: number) => sql`
  SELECT *
  FROM argument
  JOIN argument_weight
    ON argument_weight.id = argument.id
  WHERE argument.statement_id = ${statementId}   
`;
