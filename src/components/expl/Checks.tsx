import { Component, For, JSXElement } from "solid-js";
import { Subtitle } from "../PageTitle";

export const Checks: Component<{items: JSXElement[]}> = props => (
  <>
    <Subtitle>Checks</Subtitle>
    <ol class="px-6 list-decimal">
      <For each={props.items}>
        { item => <li>{item}</li>}
      </For>
    </ol>
  </>
)