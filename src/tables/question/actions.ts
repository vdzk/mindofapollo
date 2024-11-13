import { ActionParams, TableAction } from "~/schema/type";
import { countCrossRecords, deleteCrossRecord, hasCrossRecord, insertCrossRecord } from "~/server/cross.db";
import { updateRecord } from "~/server/mutate.db";
import { opposed } from "./opposed";

const xParams = {
  a: 'question',
  b: 'person',
  first: true,
}

const getMutateParams = (params: ActionParams) => ({
  ...xParams,
  a_id: params.record.id,
  b_id: params.userId
})

const numDecisionApprovals = 2

export const actions: Record<string, TableAction> = {
  approveAnswer: {
    label: 'Approve answer',
    getVisibility: async params => {
      if (params.record.decided) {
        return false
      } else {
        return !(await hasCrossRecord(getMutateParams(params)))
      }
    },
    validate: async params => {
      const requiredCount = 2
      if (!(await opposed(params.userId, params.record.id, requiredCount))) {
        return `You have not added at least ${requiredCount} argumens or critical statements to the other side of the debate. This measure is a check that actual consensus on this point is likely and its not just one side approves their points one-sidedly.`
      }
    },
    execute: async params => {
      const approvalsCount = await countCrossRecords(
        {id: params.record.id, ...xParams})

      await insertCrossRecord(getMutateParams(params))
      if (approvalsCount >= numDecisionApprovals) {
        updateRecord('question', params.record.id, {decided: true})
      }
    },
  },
  unapproveAnswer: {
    label: 'Unapprove answer',
    getVisibility: async params => {
      if (params.record.decided) {
        return false
      } else {
        return await hasCrossRecord(getMutateParams(params)) ?? false
      }
    },
    execute: params => deleteCrossRecord(getMutateParams(params)),
  },
  undecide: {
    label: 'Undecide',
    getVisibility: params => params.record.decided as boolean,
    // NOTICE: approvals are not removed until the answer / confidence changes
    execute: params => updateRecord('question', params.record.id, {decided: false})
  }
}