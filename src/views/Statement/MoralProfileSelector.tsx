import { createAsync } from "@solidjs/router"
import { Component, For } from "solid-js"
import { listRecordsCache } from "~/client-only/query"
import { etv } from "~/client-only/util"

export const MoralProfileSelector: Component<{
  value: number,
  onChange: (value: number) => void
}> = props => {
  const profiles = createAsync(() => listRecordsCache('moral_weight_profile'))
  return (
    <div class="px-2 py-2">
      Moral weights:
      <select
        class="ml-2"
        onChange={etv(valueStr => props.onChange(parseInt(valueStr)))}
      >
        <option
          value={0}
          selected={props.value === 0}
        >
          your moral weights
        </option>
        <For each={profiles()}>
          {profile => (
            <option
              value={profile.id}
              selected={profile.id === props.value}
            >
              {profile.name}
            </option>
          )}
        </For>
      </select>
    </div>
  )
}