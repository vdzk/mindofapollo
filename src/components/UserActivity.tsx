import { Component, For } from "solid-js"
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
            <Link
              route="expl"
              params={{ id: explRecord.id }}
              label={getExplActionStr(explRecord)}
            />
          </div>
        )}
      </For>
    </div>
  )
}