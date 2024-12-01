import { Match, ParentComponent, Resource, Switch } from "solid-js"

export const Task: ParentComponent<{resource: Resource<any>}> = props => {
  const state = () => props.resource.state
  const empty = () => !props.resource()
  const loadingStates = ['pending', 'refreshing']

  return (
    <Switch>
      <Match when={loadingStates.includes(state())}>
        <div class="pl-2">Loading task data...</div>
      </Match>
      <Match when={state() === 'ready' && empty()}>
        <div class="pl-2">All done</div>
      </Match>
      <Match when={state() === 'ready' && !empty()}>
        {props.children}
      </Match>
    </Switch>
  )
}