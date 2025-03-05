import { For, Show, Component } from "solid-js"
import { ExplData } from "../types"

export const Notes: Component<ExplData> = (props) => {
  return (
    <Show when={props.notes?.length}>
      <div class="px-2 max-w-screen-sm">
        <ul class="list-disc pl-6">
          <For each={props.notes}>
            {note => <li>{note}</li>}
          </For>
        </ul>
      </div>
    </Show>
  )
}
