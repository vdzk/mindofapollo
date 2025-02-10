import { Component, Match, Switch } from "solid-js"
import { DataLiteral } from "~/schema/type"

export const Link: Component<{
  params?: Record<string, any>
  label?: DataLiteral
  route: string,
  type?: 'button',
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
          class="text-sky-800"
        >
          [ {props.label} ]
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