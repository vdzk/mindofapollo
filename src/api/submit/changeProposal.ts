import { _insertRecord, insertValueType } from "~/server-only/mutate";
import { DataLiteral, DataRecordWithId } from "~/schema/type";
import { getValueTypeTableName } from "~/schema/dataTypes";
import { startExpl, finishExpl } from "~/server-only/expl";
import { getUserId, getUserActorUser } from "~/server-only/session";
import { ExplData, UserActor } from "~/components/expl/types";
import { _getRecordById } from "~/server-only/select";
import { titleColumnName } from "~/utils/schema";

export const submitChangeProposal = async (
  tableName: string,
  id: number,
  colName: string,
  oldValue: DataLiteral,
  newValue: DataLiteral,
  explanation: string
) => {
  "use server"
  const userId = await getUserId()
  const user = await getUserActorUser()
  const record = await _getRecordById(tableName, id)
  if (!record) return
  const vttn = getValueTypeTableName(tableName, colName)
  const [{ id: old_value_id }] = await insertValueType(vttn, oldValue)
  const [{ id: new_value_id }] = await insertValueType(vttn, newValue)
  const explId = await startExpl(userId, 'submitChangeProposal', 1, tableName, id);
  await _insertRecord('change_proposal', {
    table_name: tableName,
    target_id: id,
    column_name: colName,
    old_value_id,
    new_value_id,
    change_explanation: explanation
  }, explId)

  const data: ChangeProposalData = {
    tableName,
    id,
    colName,
    oldValue,
    newValue,
    userExpl: explanation,
    user,
    record,
    targetLabel: record[titleColumnName(tableName)] as string
  }
  await finishExpl(explId, data)
}

export interface ChangeProposalData {
  tableName: string
  id: number
  colName: string
  oldValue: DataLiteral
  newValue: DataLiteral
  userExpl: string
  user: UserActor['user']
  record: DataRecordWithId
  targetLabel: string
}

export const explSubmitChangeProposal = (data: ChangeProposalData): ExplData => ({
  actor: { type: 'user', user: data.user },
  action: `proposed to change ${data.colName}: ${data.oldValue} -> ${data.newValue} in`,
  target: {
    tableName: data.tableName,
    id: data.id,
    label: data.targetLabel
  },
  userExpl: data.userExpl,
  relevantRecords: {
    [data.tableName]: [data.record]
  }
})