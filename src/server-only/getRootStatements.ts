import { sqlStr } from "~/util-no-circle"
import { onError, sql } from "./db"
import { getRootTableName } from "~/utils/schema";

export interface RootStatement {
  id: number;
  text: string;
  featured: boolean;
}

export const hierarchyTableNames = ['statement', 'argument', 'critical_statement', 'argument_judgement', 'premise'] as const

export type HierarchyTableName = typeof hierarchyTableNames[number];

export const getRootStatements = async (
  tableName: HierarchyTableName,
  recordId: number
): Promise<RootStatement[]> => {
  const query = sqlStr`
    WITH RECURSIVE hierarchy AS (
      -- Base case: start with the provided record
      SELECT 
        CASE
          WHEN $1 = 'statement' THEN s.id
          WHEN $1 = 'argument' THEN a.statement_id
          WHEN $1 = 'premise' THEN p.statement_id
        END AS statement_id,
        ARRAY[]::integer[] AS path
      FROM statement s
      LEFT JOIN argument a ON $1 = 'argument' AND a.id = $2
      LEFT JOIN premise p ON $1 = 'premise' AND p.id = $2
      WHERE 
        ($1 = 'statement' AND s.id = $2) OR
        ($1 = 'argument' AND a.id = $2) OR
        ($1 = 'premise' AND p.id = $2)
      
      UNION ALL
      
      -- Single path up: statement -> premise -> argument -> statement -> ...
      SELECT 
        arg.statement_id,  -- This is the parent statement we're traversing to
        h.path || h.statement_id  -- Appends id here
      FROM hierarchy h
      JOIN premise p ON h.statement_id = p.statement_id  -- Current statement is referenced in premise
      JOIN argument arg ON p.argument_id = arg.id  -- Get argument that contains the premise
      WHERE NOT (arg.statement_id = ANY(h.path || h.statement_id))  -- Avoid circular references
    )
    
    -- Get root statements (statements with tags or featured) from the hierarchy
    SELECT DISTINCT s.id, s.featured
    FROM hierarchy h
    JOIN statement s ON h.statement_id = s.id
    LEFT JOIN statement_x_tag st ON s.id = st.statement_id
    WHERE s.featured = true OR st.tag_id IS NOT NULL
    ORDER BY s.id
  `

  const result = await sql.unsafe<RootStatement[]>(
    query, [getRootTableName(tableName), recordId]
  ).catch(onError)
  return result
}