"use server"

import { colType2pgType, pgType2valueTypeTableName } from "~/schema/dataTypes"
import { insertRecord, safeWrap, updateRecord } from "./mutate.db"
import { sql } from "./db"
import { DataLiteral } from "~/schema/type"
import { getRecordById } from "./select.db"
import { ProposalRecord } from "~/tables/change_proposal"

export const saveChangeProposal = safeWrap(async (
  userId,
  tableName: string,
  id: number,
  colName: string,
  oldValue: DataLiteral,
  newValue: DataLiteral,
  explanation: string
) => {
  const valueTypeTableName = pgType2valueTypeTableName[colType2pgType[colName]]
  const results = await sql`
    INSERT INTO ${sql(valueTypeTableName)} (value)
    VALUES (${oldValue}), (${newValue})
    RETURNING id
  `
  await insertRecord('change_proposal', {
    table_name: tableName,
    target_id: id,
    column_name: colName,
    old_value_id: results[0].id,
    new_value_id: results[1].id,
    change_explanation: explanation
  })
})

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

  const valueTypeTableName = pgType2valueTypeTableName[
    colType2pgType[proposal.column_name]]
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
    const valueTypeTableName = pgType2valueTypeTableName[
      colType2pgType[proposal.column_name]]
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