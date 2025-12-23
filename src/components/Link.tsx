import { Component, JSXElement, useContext } from "solid-js"
import { DataLiteral } from "~/schema/type"
import { btnStyle } from "./buttons"
import { buildUrl } from "~/utils/schema"
import { LinkType } from "~/types"
import { Embedded } from "~/views/TreeNavigator/Panel"

export const linkStyles = {
  default: 'hover:underline',
  block: 'block px-1.5 border border-transparent border-l-gray-600 rounded hover:border-gray-600',
  fragment: 'hover:bg-yellow-200 h-full py-1',
  button: btnStyle(),
  logo: 'font-bold',
  faded: 'text-gray-500',
  heroButton: btnStyle() + ' ' + 'text-2xl px-3 py-1'
}

export interface Relation {
  type: 'argument' | 'premise',
  positive: boolean // false if con argument or inverted statement
  forward: boolean // false if the link goes to source rather than to target
}

export const Link: Component<{
  params?: Record<string, any>
  label?: DataLiteral | JSXElement
  route: string,
  type?: LinkType,
  tooltip?: string
  class?: string
  relation?: Relation
}> = props => {
  const embedded = useContext(Embedded)

  const href = () => buildUrl(props)
  
  let className = linkStyles[props.type ?? 'default']
  if (props.class) className += ' ' + props.class
  
  return (
    <a
      href={href()}
      title={props.tooltip}
      class={className}
      onClick={event => {
        if (embedded) {
          const done = embedded.onLinkClick(props)
          if (done) {
            event.preventDefault()
            event.stopPropagation()
          }
        }
      }}
    >
      {props.label}
    </a>
  )
}

export const ExternalLink: Component<{
  href: string
  label?: string
  class?: string
}> = props => {
  const displayText = props.label || props.href?.replace(/^(https?:\/\/)?(www\.)?/, '')
  
  return (
    <a
      href={props.href}
      target="_blank"
      rel="noreferrer"
      class={"text-sky-800 break-all " + props.class}
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



