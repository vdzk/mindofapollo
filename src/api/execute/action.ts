import { belongsTo, getUserSession } from "~/server-only/session";
import { tableActions } from "~/server-only/tableActions";

export const whoCanExecuteAction = () => ['invited']

export const executeAction = async (
  tableName: string,
  actionName: string,
  recordId: number
) => {
  "use server"
  if (! await belongsTo(whoCanExecuteAction())) return
  const userSession = await getUserSession()
  const success = await tableActions[tableName][actionName](userSession.userId, recordId, true)
  if (!success) {
    return 'This action is no longer available.'
  }
};
