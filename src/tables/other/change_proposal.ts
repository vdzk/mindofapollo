import { TableSchema } from "~/schema/type";

export interface ProposalRecord {
  id: number
  table_name: string
  target_id: number
  column_name: string
  old_value_id: number
  new_value_id: number
  change_explanation: string
  votes_in_favour: number
  votes_against: number
  decided: boolean
  approved: boolean
}

export const change_proposal: TableSchema = {
  columns: {
    table_name: {
      type: 'varchar'
    },
    target_id: {
      type: 'integer'
    },
    column_name: {
      type: 'varchar',
      label: 'field'
    },
    old_value_id: {
      type: 'integer'
    },
    new_value_id: {
      type: 'integer'
    },
    change_explanation: {
      type: 'varchar',
      defaultValue: ''
    },
    votes_in_favour: {
      type: 'integer',
      defaultValue: 1
    },
    votes_against: {
      type: 'integer',
      defaultValue: 0
    },
    decided: {
      type: 'boolean',
      defaultValue: false
    },
    approved: {
      type: 'boolean',
      defaultValue: false
    }
  }
}