import { Component, Match, Switch } from "solid-js"
import { conclusionPlaceholder } from "~/tables/morality/directive"

export const DecisionIndicator: Component<{
  score: number | null
}> = props => (
  <Switch>
    <Match when={props.score === null}>
      {conclusionPlaceholder}
    </Match>
    <Match when={props.score! > 0}>
      {'👍 '}
    </Match>
    <Match when={props.score! < 0}>
      {'👎 '}
    </Match>
    <Match when={props.score === 0}>
      {'(=) '}
    </Match>
  </Switch>
)