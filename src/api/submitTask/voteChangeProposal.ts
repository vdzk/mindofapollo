import {onError, sql} from "~/server-only/db"
import {_getRecordById} from "~/server-only/select"
import { getUserActorUser, getUserId } from "~/server-only/session"
import { _updateRecord } from "~/server-only/mutate"
import { startExpl, finishExpl } from "~/server-only/expl"
import {ProposalRecord} from "~/tables/other/change_proposal"
import {getValueTypeTableName} from "~/schema/dataTypes"
import { ExplData, ExplDiff, UserActor } from "~/components/expl/types"
import { DataRecord, DataRecordWithId } from "~/schema/type"
import { titleColumnName } from "~/utils/schema"

export const submitTaskVoteChangeProposal = async (
  proposalId: number,
  inFavour: boolean
) => {
  "use server"
  const userId = await getUserId()
  const proposal = await _getRecordById('change_proposal', proposalId, ['id', 'table_name', 'column_name', 'old_value_id', 'new_value_id', 'target_id', 'votes_in_favour', 'votes_against', 'decided', 'approved']) as ProposalRecord | undefined
  if (!proposal) return
  const votesColName = inFavour ? 'votes_in_favour' : 'votes_against'

  const explId = await startExpl(userId, 'submitTaskVoteChangeProposal', 1, proposal.table_name, proposal.target_id)
  const diff = await _updateRecord('change_proposal', proposalId, explId, {
    [votesColName]: proposal[votesColName] + 1,
    decided: true,
    approved: inFavour
  });
  const user = await getUserActorUser()
  
  const targetRecord = await _getRecordById(proposal.table_name, proposal.target_id)
  if (!targetRecord) return
  const targetLabel = targetRecord[titleColumnName(proposal.table_name)] as string
  const data: ExplVoteData = { user, proposal, diff, targetLabel, targetRecord }
  await finishExpl(explId, data);

  if (!inFavour) return
  // Excute proposed change
  const trigger = { explId, label: `user voted in favour` }
  const valueTypeTableName = getValueTypeTableName(proposal.table_name, proposal.column_name)
  const results = await sql`
    SELECT *
    FROM ${sql(valueTypeTableName)}
    WHERE id = ${proposal.new_value_id}
  `.catch(onError)
  const newValue = results[0].value

  const explId2 = await startExpl(null, 'executeProposalChange', 1, proposal.table_name, proposal.target_id);
  const diff2 = await _updateRecord(proposal.table_name, proposal.target_id, explId2, {
    [proposal.column_name]: newValue
  });
  
  const data2: ExplExecuteData = { proposal, diff: diff2, trigger, targetRecord, targetLabel }
  await finishExpl(explId2, data2);
}

interface ExplVoteData {
  user: UserActor['user']
  proposal: ProposalRecord
  targetLabel: string
  diff: ExplDiff<DataRecord>
  targetRecord: DataRecordWithId
}

export const explSubmitTaskVoteChangeProposal = (data: ExplVoteData): ExplData => {
  return {
    actor: { type: 'user', user: data.user },
    action: `voted on a proposal to change "${data.proposal.column_name}" of`,
    target: {
      tableName: data.proposal.table_name,
      id: data.proposal.target_id,
      label: data.targetLabel
    },
    updatedRecords: {
      change_proposal: [{ ...data.diff, id: data.proposal.id }]
    },
    relevantRecords: {
      change_proposal: [data.proposal as unknown as DataRecord]
    },
    checks: [
      'Proposal was not decided yet',
      'The user has not voted on this proposal yet',
      'The user has not submitted a proposal to change this record themselves'
    ]
  }
}

interface ExplExecuteData {
  proposal: ProposalRecord
  diff: ExplDiff<DataRecord>
  trigger: ExplData['trigger']
  targetRecord: DataRecordWithId
  targetLabel: string
}

export const explExecuteProposalChange = (data: ExplExecuteData): ExplData => {
  return {
    actor: { type: 'system' },
    action: `executed proposal to change "${data.proposal.column_name}" of`,
    target: {
      tableName: data.proposal.table_name,
      id: data.proposal.target_id,
      label: data.targetLabel
    },
    diff: data.diff,
    trigger: data.trigger,
    relevantRecords: {
      [data.proposal.table_name]: [data.targetRecord]
    }
  }
}