import { Component, Match, Switch } from "solid-js"
import { DataLiteral } from "~/schema/type"
import { btnStyle } from "./buttons"

export const Link: Component<{
  params?: Record<string, any>
  label?: DataLiteral
  route: string,
  type?: 'button' | 'logo',
  tooltip?: string
}> = props => {
  let href = '/' + props.route
  if (props.params) {
    href += '?' + Object.entries(props.params)
      .map(([k, v]) => k + '=' + v)
      .join('&')
  }
  const sharedProps = { href, title: props.tooltip }
  return (
    <Switch>
      <Match when={props.type === 'button'}>
        <a
          {...sharedProps}
          class={btnStyle}
        >
          {props.label}
        </a>
      </Match>
      <Match when={props.type === 'logo'}>
        <a
          {...sharedProps}
          class="font-bold"
        >
          {props.label}
        </a>
      </Match>
      <Match when>
        <a
          {...sharedProps}
          class="hover:underline"
        >
          {props.label}
        </a>
      </Match>
    </Switch>
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

