import { askToJudgeEvidentialStatement } from "~/api/askToJudge/evidentialStatement"
import { askToJudgeAdditiveStatement } from "~/api/askToJudge/additiveStatement"

export type TableAction = (
  recordId: number,
  execute: boolean
) => Promise<void | string | boolean>

export const tableActions: Record<string, Record<string, TableAction>> = {
  statement: {
    askToJudgeEvidentialStatement,
    askToJudgeAdditiveStatement
  }
}

export const listVisibleActions = async (
  tableName: string,
  recordId: number
) => {
  if (tableActions[tableName]) {
    const promises = Object.entries(tableActions[tableName]).map(
      async ([name, action]) => {
        const actionLabel = await action(recordId, false);
        return actionLabel ? { name, label: actionLabel as string } : null;
      }
    )
    const resolved = await Promise.all(promises)
    const filtered = resolved.filter(x => x !== null)
    return filtered
  } else {
    return []
  }
}

export const executeAction = async (
  tableName: string,
  actionName: string,
  recordId: number
) => {
  const success = await tableActions[tableName][actionName](recordId, true);
  if (!success) {
    return 'This action is no longer available.'
  }
}

