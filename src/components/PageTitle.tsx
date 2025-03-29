import { Component, JSXElement, ParentComponent } from "solid-js";
import { firstCap, humanCase } from "~/utils/string";

export const PageTitle: Component<{
  children: JSXElement,
  textSize?: string
}> = (props) => {
  return (
    <h1
      class="font-bold px-2 py-4 first-letter:uppercase"
      classList={{
        'text-3xl': !props.textSize,
        [props.textSize || '']: !!props.textSize
      }}
    >
      {props.children}
    </h1>
  )
}

export const Subtitle: ParentComponent = (props) => {
  return (
    <h1 class="text-xl font-bold px-2 py-2 first-letter:uppercase">{props.children}</h1>
  )
}

export const H2: ParentComponent = (props) => {
  return (
    <h2 class="text-lg font-bold px-2 py-1.5 first-letter:uppercase">{props.children}</h2>
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
    <PageTitle textSize={props.text.length > 200 ? 'text-2xl' : ''}>
      {props.text}
    </PageTitle>
  </div>
)
