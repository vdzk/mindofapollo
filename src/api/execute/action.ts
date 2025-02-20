"use server";
import { getUserSession } from "~/server-only/session";
import { tableActions } from "~/server-only/tableActions";


export const executeAction = async (
  tableName: string,
  actionName: string,
  recordId: number
) => {
  const userSession = await getUserSession();
  const success = await tableActions[tableName][actionName](userSession.userId, recordId, true);
  if (!success) {
    return 'This action is no longer available.';
  }
};
