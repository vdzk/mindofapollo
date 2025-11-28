import { ParentComponent, Show } from "solid-js";
import { H2 } from "./PageTitle";

export const nestedBgColor = (formDepth?: number) =>
  (formDepth ?? 0) % 2 === 0 ? 'bg-orange-100' : 'bg-orange-50'

export const NestPanel: ParentComponent<{
  title?: string,
  class?: string
}> = (props) => {
  return (
    <div
      class="bg-orange-100 rounded-md max-w-fit"
      classList={props.class ? {[props.class]: true} : {}}
    >
      <Show when={props.title}>
        <H2>{props.title}</H2>
      </Show>
      <div class="px-2 pb-2">
        {props.children}
      </div>
    </div>
  )
}