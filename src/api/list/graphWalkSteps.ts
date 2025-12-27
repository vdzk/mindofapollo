import { getRootStatements } from "~/server-only/getRootStatements"
import { onError, sql } from "~/server-only/db"
import { injectVirtualValues } from "~/server-only/select"
import { DataRecordWithId } from "~/schema/type"

export type GraphTableName = 'statement' | 'argument'

export interface WalkRow {
  node_type: 'statement' | 'argument'
  id: number
  parent_type: 'statement' | 'argument' | null
  parent_id: number | null
  pro: boolean | null
  invert: boolean | null
  label: string
}

export const listGraphWalkSteps = async (
  tableName: GraphTableName,
  recordId: number
) => {
  "use server"
  const rootStatements = await getRootStatements(tableName, recordId)
  const rootStatementIds = rootStatements.map(statement => statement.id)
  if (rootStatements.length === 0) {
    return { rows: [], rootStatementIds: [] }
  }

  const rows = await sql<WalkRow[]>`
  WITH RECURSIVE
  seed(statement_id) AS (
    SELECT unnest(${sql.array(rootStatementIds)}::integer[]) AS statement_id
  ),
  walk(
    node_type,
    id,
    parent_type,
    parent_id,
    pro,
    invert,
    key_path
  ) AS (
    -- base: roots
    SELECT
      'statement'::text,
      s.id::int,
      NULL::text,
      NULL::int,
      NULL::boolean,
      NULL::boolean,
      ARRAY[('statement:' || s.id)]::text[]
    FROM statement s
    JOIN seed ON seed.statement_id = s.id

    UNION ALL

    -- recursive: single reference to walk, branch via LATERAL
    SELECT
      nxt.node_type,
      nxt.id,
      nxt.parent_type,
      nxt.parent_id,
      nxt.pro,
      nxt.invert,
      nxt.key_path
    FROM walk w
    CROSS JOIN LATERAL (
      -- statement -> arguments
      SELECT
        'argument'::text AS node_type,
        a.id::int AS id,
        'statement'::text AS parent_type,
        w.id::int AS parent_id,
        a.pro::boolean AS pro,
        NULL::boolean AS invert,
        w.key_path || ('argument:' || a.id) AS key_path
      FROM argument a
      WHERE w.node_type = 'statement'
        AND a.statement_id = w.id
        AND NOT (('argument:' || a.id) = ANY(w.key_path))

      UNION ALL

      -- argument -> premise statements
      SELECT
        'statement'::text AS node_type,
        s2.id::int AS id,
        'argument'::text AS parent_type,
        w.id::int AS parent_id,
        NULL::boolean AS pro,
        p.invert::boolean AS invert,
        w.key_path || ('statement:' || s2.id) AS key_path
      FROM premise p
      JOIN statement s2 ON s2.id = p.statement_id
      WHERE w.node_type = 'argument'
        AND p.argument_id = w.id
        AND NOT (('statement:' || s2.id) = ANY(w.key_path))
    ) AS nxt
  ),

  -- ✅ remove duplicate EDGES (same parent->child) emitted via different paths
  dedup AS (
    SELECT DISTINCT ON (
      w.node_type,
      w.id,
      w.parent_type,
      w.parent_id,
      COALESCE(w.invert, false)
    )
      w.node_type,
      w.id,
      w.parent_type,
      w.parent_id,
      w.pro,
      w.invert
    FROM walk w
    -- deterministic choice if duplicates exist: prefer shorter path, then stable tie-break
    ORDER BY
      w.node_type,
      w.id,
      w.parent_type,
      w.parent_id,
      COALESCE(w.invert, false),
      array_length(w.key_path, 1) ASC,
      w.key_path ASC
  )

  SELECT
    d.node_type,
    d.id,
    d.parent_type,
    d.parent_id,
    d.pro,
    d.invert,
    CASE
      WHEN d.node_type = 'statement' THEN ts.english
      ELSE ta.english
    END AS label
  FROM dedup d
  LEFT JOIN translation ts
    ON d.node_type = 'statement'
   AND ts.table_name = 'statement'
   AND ts.column_name = 'text'
   AND ts.record_id = d.id
  LEFT JOIN translation ta
    ON d.node_type = 'argument'
   AND ta.table_name = 'argument'
   AND ta.column_name = 'title'
   AND ta.record_id = d.id
  `.catch(onError)

  // Add missing labels in statements
  const emptyLabelRows = rows.filter(row => row.node_type === 'statement' && !row.label) as unknown as  DataRecordWithId[]
  await injectVirtualValues('statement', emptyLabelRows, ['label'])
  // Remove the score placeholder from the label
  emptyLabelRows.forEach(row => {
    let label = row.label
    if (typeof label === 'string' && !!label) {
      row.label = label.slice(label.indexOf(')') + 2)
    } else {
      row.label = '<missing label>'
    }
  })

  return { rows, rootStatementIds }
}