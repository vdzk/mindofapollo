"use server"

import {getValueTypeTableName} from "~/schema/dataTypes"
import {sql} from "../../server-only/db"
import {_getRecordById} from "../../server-only/select"
import {ProposalRecord} from "~/tables/other/change_proposal"
import { getUserSession } from "../../server-only/session"
import { _updateRecord } from "../../server-only/mutate";
import { startExpl, finishExpl } from "../../server-only/expl";

export const getTaskVoteChangeProposal = async () => {
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

export const submitTaskVoteChangeProposal = async (
  proposalId: number,
  inFavour: boolean
) => {
  const userSession = await getUserSession()
  const proposal = await _getRecordById('change_proposal', proposalId, ['id', 'table_name', 'column_name', 'old_value_id', 'new_value_id', 'target_id', 'votes_in_favour', 'votes_against', 'decided', 'approved']) as ProposalRecord | undefined
  if (!proposal) return
  const votesColName = inFavour ? 'votes_in_favour' : 'votes_against'

  // Update change_proposal record using _updateRecord
  const explId1 = await startExpl(userSession.userId, 'genericChange', 1, 'change_proposal', proposalId);
  const diff1 = await _updateRecord('change_proposal', proposalId, explId1, {
    [votesColName]: proposal[votesColName] + 1,
    decided: true,
    approved: inFavour
  });
  await finishExpl(explId1, { diff: diff1 });

  if (inFavour) {
    // Retrieve the new value
    const valueTypeTableName = getValueTypeTableName(proposal.table_name, proposal.column_name)
    const results = await sql`
      SELECT *
      FROM ${sql(valueTypeTableName)}
      WHERE id = ${proposal.new_value_id}
    `
    const newValue = results[0].value

    // Execute the proposal update using _updateRecord
    const explId2 = await startExpl(userSession.userId, 'genericChange', 1, proposal.table_name, proposal.target_id);
    const diff2 = await _updateRecord(proposal.table_name, proposal.target_id, explId2, {
      [proposal.column_name]: newValue
    });
    await finishExpl(explId2, { diff: diff2 });
  }
}
