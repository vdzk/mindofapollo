import { Component } from "solid-js";

export const Button: Component<{
  label: string
  onClick: () => void
  tooltip?: string
}> = props => {
  return (
    <button
      class="text-sky-800"
      onClick={props.onClick}
      title={props.tooltip}
    >
      [ {props.label} ]
    </button>
  )
}