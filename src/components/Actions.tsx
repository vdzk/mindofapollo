import { createAsync, useAction } from "@solidjs/router";
import { Component, createEffect, createSignal, For, Show, useContext } from "solid-js";
import { schema } from "~/schema/schema";
import { ActionParams, DataRecordWithId, TableAction } from "~/schema/type";
import { executeTableAction, getVisibleActionsCache } from "~/server/api";
import { getUserId } from "~/server/session";
import { SessionContext } from "~/SessionContext";

export const getVisibleActions = async (
  tableName: string,
  record: DataRecordWithId
) => {
  const { actions } = schema.tables[tableName]
  if (!actions) return []
  const userId = await getUserId()
  if (!userId) return []

  return (await Promise.all(
    Object.values(actions).map(
      async action => {
        const visible = await action.getVisibility({ userId, record})
        return visible ? action : null
      }
    )
  )).filter(x => x !== null)
}

const Action: Component<{
  tableName: string
  action: TableAction
  actionParams: ActionParams
}> = props => {
  const executeTable = useAction(executeTableAction)
  const [validationError, setValidationError] = createSignal<string>()

  const onClick = async () => {
    setValidationError(await executeTable(props.tableName, props.action, props.actionParams))
  }

  return (
    <Show when={!validationError()} fallback={(
      <div class="bg-red-100 rounded mx-2 px-2 max-w-md">
        {validationError()}
      </div>
    )}>
      <div class="px-2 ">
        <button class="text-sky-800" {...{onClick}}>
          [ {props.action.label} ]
        </button>
      </div>
    </Show>
  )
} 

export const Actions: Component<{
  tableName: string
  record: DataRecordWithId
}> = props => {
  const session = useContext(SessionContext)
  const userId = session?.user()!.id!

  const actions = createAsync(() => getVisibleActionsCache(props.tableName, props.record))

  return (
    <Show when={(actions()?.length ?? 0) > 0 && userId}>
      <section class="pb-2">
        <div class="px-2 font-bold">Actions</div>
        <For each={actions()!}>
          {action => <Action
            tableName={props.tableName}
            {...{action}}
            actionParams={{userId, record: props.record}}
          />}
        </For>
      </section>
    </Show>
  )
}