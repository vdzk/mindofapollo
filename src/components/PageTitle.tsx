import { ParentComponent } from "solid-js";

export const PageTitle:ParentComponent = (props) => {
  return (
    <h1 class="text-2xl px-2 py-4 first-letter:uppercase">{props.children}</h1>
  )
}