import { Component } from "solid-js"
import { DataLiteral } from "~/schema/type"
import { btnStyle } from "./buttons"
import { buildUrl } from "~/util"

export const Link: Component<{
  params?: Record<string, any>
  label?: DataLiteral
  route: string,
  type?: 'button' | 'logo',
  tooltip?: string
}> = props => {
  const href = buildUrl(props.route, props.params)
  
  let className = 'hover:underline'
  if (props.type === 'button') className = btnStyle()
  if (props.type === 'logo') className = 'font-bold'
  
  return <a href={href} title={props.tooltip} class={className}>{props.label}</a>
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

