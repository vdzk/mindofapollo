import { Component } from "solid-js";

export const btnStyle = (params?: { disabled?: boolean }) => `
  cursor-pointer
  /* Layout */
  rounded-lg
  px-2
  leading-6
  inline-block

  /* Colors */
  bg-yellow-400
  text-gray-900
  ${!params?.disabled ? 'hover:bg-yellow-500' : ''}

  /* Disabled state */
  ${params?.disabled ? 'opacity-50 cursor-default' : ''}
`.trim()

export const Button: Component<{
  label: string
  onClick: () => void
  tooltip?: string
  disabled?: boolean
  class?: string
}> = props => {
  return (
    <button
      class={`${btnStyle({ disabled: props.disabled })} ${props.class || ''}`}
      onClick={props.onClick}
      title={props.tooltip}
      type="button"
      disabled={props.disabled}
    >
      {props.label}
    </button>
  )
}