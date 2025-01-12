"use server"

import {getValueTypeTableName} from "~/schema/dataTypes"
import {safeWrap, updateRecord} from "../shared/mutate"
import {sql} from "../../db"
import {getRecordById} from "../shared/select"
import {ProposalRecord} from "~/tables/other/change_proposal"

export const getChangeProposal = safeWrap(async (userId) => {
  const proposals = await sql`
    WITH user_changes AS (
      SELECT id
      FROM change_proposal_h
      WHERE op_user_id = ${userId} AND data_op IN ('INSERT', 'UPDATE')
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
})

export const voteChangeProposal = safeWrap(async (
  userId,
  proposalId: number,
  inFavour: boolean
) => {
  const proposal = await getRecordById('change_proposal', proposalId) as ProposalRecord | undefined
  if (!proposal) return
  const votesColName = inFavour ? 'votes_in_favour' : 'votes_against'
  await updateRecord('change_proposal', proposalId, {
    [votesColName]: proposal[votesColName] + 1,
    decided: true,
    approved: inFavour
  })
  if (inFavour) {
    // Retrieve the new value
    const valueTypeTableName = getValueTypeTableName(proposal.table_name, proposal.column_name)
    const results = await sql`
      SELECT *
      FROM ${sql(valueTypeTableName)}
      WHERE id = ${proposal.new_value_id}
    `
    const newValue = results[0].value

    // execute the proposal
    await updateRecord(
      proposal.table_name,
      proposal.target_id,
      {[proposal.column_name]: newValue}
    )
  }
})
