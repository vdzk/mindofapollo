import { Component, JSXElement } from "solid-js"
import { DataLiteral } from "~/schema/type"
import { btnStyle } from "./buttons"
import { buildUrl } from "~/utils/schema"

export const linkStyles = {
  default: 'hover:underline',
  block: 'block px-1.5 border border-transparent hover:border-gray-600 rounded',
  fragment: 'hover:bg-yellow-200 h-full py-1',
  button: btnStyle(),
  logo: 'font-bold',
  faded: 'text-gray-500'
}

export const Link: Component<{
  params?: Record<string, any>
  label?: DataLiteral | JSXElement
  route: string,
  type?: 'button' | 'fragment' | 'block' | 'logo' | 'faded',
  tooltip?: string
  class?: string
  block?: boolean
}> = props => {

  const href = () => buildUrl(props)
  
  let className = linkStyles[props.type ?? 'default']
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
      class={props.className || "text-sky-800 break-all"}
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
          <Link {...link} type={props.type} class="mb-2" />
        </>
      ))}
    </>
  )
}



