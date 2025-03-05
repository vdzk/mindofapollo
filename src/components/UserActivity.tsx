import { Component, For, Match, Switch } from "solid-js"
import { createAsync } from "@solidjs/router"
import { Link } from "./Link"
import { listUserActivity } from "~/api/list/userActivity"
import { getExplActionStr } from "./expl/Expl";

export const UserActivity: Component<{id: number}> = props => {
  const activity = createAsync(() => listUserActivity(props.id))

  return (
    <div class="px-2">
      <For each={activity()}>
        {(explRecord) => (
          <div>
            <Switch>
              <Match when={explRecord.data}>
                <Link
                  route="expl"
                  params={{ id: explRecord.id }}
                  label={getExplActionStr(explRecord)}
                />
              </Match>
              <Match when>
                <div>{explRecord.action}</div>
              </Match>
            </Switch>
          </div>
        )}
      </For>
    </div>
  )
}