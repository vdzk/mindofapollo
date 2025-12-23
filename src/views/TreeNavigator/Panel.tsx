import { Component, ComponentProps, createContext, Show } from "solid-js"
import { Link } from "~/components/Link"
import { Dynamic } from "solid-js/web"
import { Statement } from "../Statement/Statement"
import { Argument } from "../Argument/Argument"
import { GraphNode } from "./TreeNavigator"

export const Embedded = createContext<{
  onLinkClick: (linkProps: ComponentProps<typeof Link>) => boolean | void
}>()

const components: Record<string, Component<any>> = {
  statement: Statement,
  argument: Argument
}

export const Panel: Component<{
  curNode?: GraphNode
  onEmbeddedLinkClick: (linkProps: ComponentProps<typeof Link>) => boolean | void
}> = props => {
  const embedded = {onLinkClick: props.onEmbeddedLinkClick}
  return (
    <div class="border-l flex-1">
      <Embedded.Provider value={embedded}>
        <Show when={props.curNode}>
          <Dynamic
            component={components[props.curNode!.tableName]}
            id={props.curNode!.id}
          />
        </Show>
      </Embedded.Provider>
    </div>
  )
}