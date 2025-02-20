import {sql} from "~/server-only/db"
import {_getRecordById} from "~/server-only/select"
import { getUserSession } from "~/server-only/session"
import { _updateRecord } from "~/server-only/mutate"
import { startExpl, finishExpl } from "~/server-only/expl"
import {ProposalRecord} from "~/tables/other/change_proposal"
import {getValueTypeTableName} from "~/schema/dataTypes"

export const submitTaskVoteChangeProposal = async (
  proposalId: number,
  inFavour: boolean
) => {
  "use server"
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