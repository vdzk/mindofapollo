import { Component } from "solid-js";

export const btnStyle = (params?: { disabled?: boolean, leading?: number }) => `
  ${!params?.disabled ? 'cursor-pointer' : ''} 
  
  /* Layout */
  rounded-lg
  px-2
  leading-${params?.leading ?? 6}
  inline-block

  /* Colors */
  bg-yellow-400
  text-gray-900
  ${!params?.disabled ? 'hover:bg-yellow-500' : ''}

  /* Disabled state */
  ${params?.disabled ? 'opacity-50 cursor-default' : ''}
`.trim()

export const importantButtonStyle = 'text-xl py-1 px-2'

export const Button: Component<{
  label: string
  onClick: () => void
  tooltip?: string
  disabled?: boolean
  leading?: number
  class?: string
}> = props => {
  return (
    <button
      class={`${btnStyle(props)} ${props.class || ''}`}
      onClick={props.onClick}
      title={props.tooltip}
      type="button"
      disabled={props.disabled}
    >
      {props.label}
    </button>
  )
}