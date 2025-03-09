import { Component, ParentComponent } from "solid-js";
import { firstCap, humanCase } from "~/utils/string";

export const PageTitle: ParentComponent = (props) => {
  return (
    <h1 class="text-3xl font-bold px-2 py-4 first-letter:uppercase">{props.children}</h1>
  )
}

export const Subtitle: ParentComponent = (props) => {
  return (
    <h1 class="text-xl font-bold px-2 py-2 first-letter:uppercase">{props.children}</h1>
  )
}

export const AbovePageTitle: ParentComponent<{label: string}> =
  (props) => <div class="relative top-5 pl-2.5">{props.label}</div>

export const RecordPageTitle: Component<{
  tableName: string,
  text: string
}> = props => (
  <div>
    <AbovePageTitle label={firstCap(humanCase(props.tableName)) + ':'} />
    <PageTitle>
      {props.text}
    </PageTitle>
  </div>
)
