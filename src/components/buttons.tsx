import { Component } from "solid-js";

// export const btnStyle = `border-2 border-black rounded-lg bg-yellow-400 
// px-2 hover:bg-yellow-500 leading-6 inline-block`
// export const btnStyle = `rounded-md bg-blue-500 text-white 
// px-2 hover:bg-blue-700 leading-6 inline-block`

export const btnStyle = ` rounded-lg bg-yellow-400 text-gray-900
px-2 hover:bg-yellow-500 leading-6 inline-block`

export const Button: Component<{
  label: string
  onClick: () => void
  tooltip?: string
}> = props => {
  return (
    <button
      class={btnStyle}
      onClick={props.onClick}
      title={props.tooltip}
    >
      {props.label}
    </button>
  )
}