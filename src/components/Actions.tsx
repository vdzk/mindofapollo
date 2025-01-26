import { createAsync, useAction } from "@solidjs/router";
import { Component, createSignal, For, Show, useContext } from "solid-js";
import { SessionContext } from "~/SessionContext";
import {getVisibleActionsCache} from "~/client-only/query";
import {executeTableAction} from "~/client-only/action";
import { Id } from "~/types";

const Action: Component<{
  tableName: string
  recordId: Id
  name: string
  label: string
}> = props => {
  const executeTable = useAction(executeTableAction)
  const [validationError, setValidationError] = createSignal<string>()

  const onClick = async () => {
    setValidationError(await executeTable(props.tableName, props.name, props.recordId))
  }

  return (
    <Show when={!validationError()} fallback={(
      <div class="bg-red-100 rounded mx-2 px-2 max-w-md">
        {validationError()}
      </div>
    )}>
      <div class="px-2 ">
        <button class="text-sky-800" {...{onClick}}>
          [ {props.label} ]
        </button>
      </div>
    </Show>
  )
}

export const Actions: Component<{
  tableName: string
  recordId: Id
}> = props => {
  const session = useContext(SessionContext)
  const userId = session?.user()!.id!

  const actions = createAsync(() => getVisibleActionsCache(props.tableName, props.recordId))

  return (
    <Show when={(actions()?.length ?? 0) > 0 && userId}>
      <section class="pb-2">
        <For each={actions()!}>
          {action => <Action
            tableName={props.tableName}
            recordId={props.recordId}
            {...action}
          />}
        </For>
      </section>
    </Show>
  )
}
