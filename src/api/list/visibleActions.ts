"use server";
import { getUserSession } from "~/server-only/session";
import { tableActions } from "~/server-only/tableActions";


export const listVisibleActions = async (
  tableName: string,
  recordId: number
) => {
  const userSession = await getUserSession();
  if (tableActions[tableName]) {
    const promises = Object.entries(tableActions[tableName]).map(
      async ([name, action]) => {
        const actionLabel = await action(userSession.userId, recordId, false);
        return actionLabel ? { name, label: actionLabel as string } : null;
      }
    );
    const resolved = await Promise.all(promises);
    const filtered = resolved.filter(x => x !== null);
    return filtered;
  } else {
    return [];
  }
};
