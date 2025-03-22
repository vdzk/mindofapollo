import { Component, JSXElement } from "solid-js"
import { DataLiteral } from "~/schema/type"
import { btnStyle } from "./buttons"
import { buildUrl } from "~/utils/string"

export const Link: Component<{
  params?: Record<string, any>
  label?: DataLiteral | JSXElement
  route: string,
  type?: 'button' | 'logo' | 'faded',
  tooltip?: string
  class?: string
}> = props => {

  const href = () => buildUrl(props.route, props.params)
  
  let className = 'hover:underline'
  if (props.type === 'button') className = btnStyle()
  if (props.type === 'logo') className = 'font-bold'
  if (props.type === 'faded') className = 'text-gray-500'

  if (props.class) className += ' ' + props.class
  
  return <a href={href()} title={props.tooltip} class={className}>{props.label}</a>
}

export const ExternalLink: Component<{
  href: string
  label?: string
  className?: string
}> = props => {
  const displayText = props.label || props.href?.replace(/^(https?:\/\/)?(www\.)?/, '')
  
  return (
    <a
      href={props.href}
      target="_blank"
      rel="noreferrer"
      class={props.className || "text-sky-800"}
    >
      {displayText}
    </a>
  )
}

export const Links: Component<{
  links: Array<{
    params?: Record<string, any>
    label?: DataLiteral
    route: string
    tooltip?: string
  }>,
  type?: 'button'
}> = props => {
  return (
    <>
      {props.links.map((link, index) => (
        <>
          {index > 0 && <span class="w-2 inline-block" />}
          <Link {...link} type={props.type} />
        </>
      ))}
    </>
  )
}



