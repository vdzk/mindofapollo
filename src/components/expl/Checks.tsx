import { Component, For, JSXElement } from "solid-js";
import { Subtitle } from "../PageTitle";

export const Checks: Component<{items: JSXElement[]}> = props => (
  <>
    <Subtitle>Checks</Subtitle>
    <ol>
      <For each={props.items}>
        { item => <li>{item}</li>}
      </For>
    </ol>
  </>
)