import {getValueTypeTableName} from "~/schema/dataTypes"
import {sql} from "~/server-only/db"
import {ProposalRecord} from "~/tables/other/change_proposal"
import { getUserSession } from "~/server-only/session"

export const getTaskVoteChangeProposal = async () => {
  "use server"
  const userSession = await getUserSession()
  const proposals = await sql`
    WITH user_changes AS (
      SELECT id
      FROM change_proposal_h
      WHERE op_user_id = ${userSession.userId} AND data_op IN ('INSERT', 'UPDATE')
    )
    SELECT *
    FROM change_proposal
    WHERE decided = false
      AND id NOT IN (SELECT id FROM user_changes)
    ORDER BY RANDOM()
    LIMIT 1
  `
  const proposal = proposals[0] as ProposalRecord | undefined

  if (!proposal) return

  const valueTypeTableName = getValueTypeTableName(proposal.table_name, proposal.column_name)
  const oldValues = await sql`
    SELECT *
    FROM ${sql(valueTypeTableName)}
    WHERE id = ${proposal.old_value_id}
  `
  const newValues = await sql`
    SELECT *
    FROM ${sql(valueTypeTableName)}
    WHERE id = ${proposal.new_value_id}
  `
  return {
    ...proposal,
    old_value: oldValues[0].value,
    new_value: newValues[0].value,
  }
}