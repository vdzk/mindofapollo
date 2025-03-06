import { sqlStr } from "~/util-no-circle"
import { onError, sql } from "./db"

export interface RootStatement {
  id: number;
  text: string;
  featured: boolean;
}

export const hierarchyTableNames = ['statement', 'argument', 'critical_statement'] as const

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
          WHEN $1 = 'critical_statement' THEN cs.statement_id
        END AS statement_id,
        ARRAY[]::integer[] AS path
      FROM statement s
      LEFT JOIN argument a ON $1 = 'argument' AND a.id = $2
      LEFT JOIN critical_statement cs ON $1 = 'critical_statement' AND cs.id = $2
      WHERE 
        ($1 = 'statement' AND s.id = $2) OR
        ($1 = 'argument' AND a.id = $2) OR
        ($1 = 'critical_statement' AND cs.id = $2)
      
      UNION ALL
      
      -- Single path up: statement -> critical_statement -> argument -> statement -> ...
      SELECT 
        arg.statement_id,  -- This is the parent statement we're traversing to
        h.path || h.statement_id  -- Appends id here
      FROM hierarchy h
      JOIN critical_statement cs ON h.statement_id = cs.statement_id  -- Current statement is referenced in critical_statement
      JOIN argument arg ON cs.argument_id = arg.id  -- Get argument that contains the critical_statement
      WHERE NOT (arg.statement_id = ANY(h.path || h.statement_id))  -- Avoid circular references
    )
    
    -- Get root statements (statements with tags or featured) from the hierarchy
    SELECT DISTINCT s.id, s.text, s.featured
    FROM hierarchy h
    JOIN statement s ON h.statement_id = s.id
    LEFT JOIN statement_x_tag st ON s.id = st.statement_id
    WHERE s.featured = true OR st.tag_id IS NOT NULL
    ORDER BY s.id
  `

  const result = await sql.unsafe<RootStatement[]>(
    query, [tableName, recordId]
  ).catch(onError)
  return result
}