import { For, Show, Component } from "solid-js"
import { ExplData } from "../types"

export const Checks: Component<ExplData> = (props) => {
  return (
    <Show when={props.checks?.length}>
      <div class="px-2">
        <ul class="list-decimal pl-6">
          <For each={props.checks}>
            {check => <li>{check}</li>}
          </For>
        </ul>
      </div>
    </Show>
  )
}
