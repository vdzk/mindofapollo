"use server"

import { sql } from "~/server/db"

/* This query checks whether a specific user has created at least ${count} entities (arguments, or critical statements) that oppose a given question within a hierarchical structure. It starts by calculating the net effect of the given question as it propagates through the hierarchy, considering how each related entity influences the overall stance. It then retrieves all entities the user has inserted and calculates their net effects in the same hierarchy. By comparing these effects, the query determines if the user has at least ${count} entities that are on the opposite side of the given question, effectively identifying the user's opposing contributions. */

export const opposed = async (
  userId: number,
  questionId: number,
  count: number
) => {

  const result = await sql`
    WITH RECURSIVE net_effects AS (
      -- Base case: start from the given question
      SELECT
        q.id AS node_id,
        'question' AS node_type,
        1 AS net_effect
      FROM
        question q
      WHERE
        q.id = ${questionId}

      UNION ALL

      -- Recursive term: combine all recursive steps into a single SELECT statement
      SELECT
        next_node.node_id,
        next_node.node_type,
        next_node.net_effect
      FROM
        net_effects ne
      JOIN LATERAL (
        -- Move up to critical statements where critical_question_ID = current question ID
        SELECT
          cs.id AS node_id,
          'critical_statement' AS node_type,
          ne.net_effect * -1 AS net_effect
        FROM
          critical_statement cs
        WHERE
          ne.node_type = 'question' AND cs.critical_question_id = ne.node_id

        UNION ALL

        -- Move up to arguments via critical_statement.argument_ID
        SELECT
          a.id AS node_id,
          'argument' AS node_type,
          ne.net_effect * CASE WHEN a.pro THEN 1 ELSE -1 END AS net_effect
        FROM
          critical_statement cs
          JOIN argument a ON
            cs.argument_id = a.id
        WHERE
          ne.node_type = 'critical_statement' AND ne.node_id = cs.id

        UNION ALL

        -- Move up to parent questions via argument.question_ID
        SELECT
          q.id AS node_id,
          'question' AS node_type,
          ne.net_effect AS net_effect
        FROM
          argument a
          JOIN question q ON
            a.question_id = q.id
        WHERE
          ne.node_type = 'argument' AND ne.node_id = a.id
      ) next_node ON TRUE
    ), user_records AS (
      -- Get all arguments and critical statements created by the user with INSERT operations only
      SELECT id AS node_id, 'argument' AS node_type
      FROM argument_h
      WHERE op_user_id = ${userId} AND data_op = 'INSERT'

      UNION

      SELECT id AS node_id, 'critical_statement' AS node_type
      FROM critical_statement_h
      WHERE op_user_id = ${userId} AND data_op = 'INSERT'
    ), user_net_effects AS (
      -- Calculate net effects for user's records
      SELECT
        ur.node_id,
        ur.node_type,
        ne.net_effect
      FROM
        user_records ur
        JOIN net_effects ne ON
          ur.node_id = ne.node_id AND ur.node_type = ne.node_type
    )
    SELECT
      COUNT(DISTINCT user_net_effects.node_id) AS opposite_side_records
    FROM
      user_net_effects
    WHERE
      user_net_effects.net_effect = -1 * (
        SELECT net_effect FROM net_effects WHERE node_id = ${questionId} AND node_type = 'question' LIMIT 1
      )
    HAVING
      COUNT(DISTINCT user_net_effects.node_id) >= ${count};
  `
  return result.length > 0
}