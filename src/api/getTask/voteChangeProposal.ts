import {getValueTypeTableName} from "~/schema/dataTypes"
import {onError, sql} from "~/server-only/db"
import {ProposalRecord} from "~/tables/other/change_proposal"
import { getUserId } from "~/server-only/session"

export const getTaskVoteChangeProposal = async () => {
  "use server"
  const userId = await getUserId()
  const proposals = await sql`
    SELECT *
    FROM change_proposal
    WHERE decided = false
    AND NOT EXISTS (
      SELECT 1
      FROM expl
      WHERE user_id = ${userId}
      AND table_name = change_proposal.table_name
      AND record_id = change_proposal.target_id
      AND (action = 'submitTaskVoteChangeProposal' OR action = 'submitChangeProposal')
    )
    ORDER BY RANDOM()
    LIMIT 1
  `.catch(onError)
  const proposal = proposals[0] as ProposalRecord | undefined

  if (!proposal) return

  const valueTypeTableName = getValueTypeTableName(proposal.table_name, proposal.column_name)
  const oldValues = await sql`
    SELECT *
    FROM ${sql(valueTypeTableName)}
    WHERE id = ${proposal.old_value_id}
  `.catch(onError)
  const newValues = await sql`
    SELECT *
    FROM ${sql(valueTypeTableName)}
    WHERE id = ${proposal.new_value_id}
  `.catch(onError)
  return {
    ...proposal,
    old_value: oldValues[0].value,
    new_value: newValues[0].value,
  }
}