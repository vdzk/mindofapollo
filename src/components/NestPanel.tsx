import { ParentComponent } from "solid-js";
import { H2 } from "./PageTitle";

export const NestPanel: ParentComponent<{
  title: string,
  class?: string
}> = (props) => {
  return (
    <div
      class="bg-orange-100 rounded-md w-fit"
      classList={props.class ? {[props.class]: true} : {}}
    >
      <H2>{props.title}</H2>
      <div class="px-2 pb-2">
        {props.children}
      </div>
    </div>
  )
}