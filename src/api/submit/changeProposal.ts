import { _insertRecord, insertValueType } from "~/server-only/mutate";
import { DataLiteral } from "~/schema/type";
import { getValueTypeTableName } from "~/schema/dataTypes";
import { startExpl } from "~/server-only/expl";
import { getUserSession } from "../../server-only/session";

export const submitChangeProposal = async (
  tableName: string,
  id: number,
  colName: string,
  oldValue: DataLiteral,
  newValue: DataLiteral,
  explanation: string
) => {
  "use server"
  const userSession = await getUserSession()
  const vttn = getValueTypeTableName(tableName, colName)
  const [{ id: old_value_id }] = await insertValueType(vttn, oldValue)
  const [{ id: new_value_id }] = await insertValueType(vttn, newValue)
  const explId = await startExpl(userSession.userId, 'genericChange', 1, 'change_proposal', null);
  await _insertRecord('change_proposal', {
    table_name: tableName,
    target_id: id,
    column_name: colName,
    old_value_id,
    new_value_id,
    change_explanation: explanation
  }, explId)
}