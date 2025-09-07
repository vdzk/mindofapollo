import { createAsync } from "@solidjs/router"
import { Component, For } from "solid-js"
import { listRecordsCache } from "~/client-only/query"
import { etv } from "~/client-only/util"
import { NestPanel } from "~/components/NestPanel"

export const MoralProfileSelector: Component<{
  value: number,
  onChange: (value: number) => void
}> = props => {
  const profiles = createAsync(() => listRecordsCache('moral_weight_profile'))
  return (
    <NestPanel class="mx-2 pt-2 mb-2">
      <span class="font-bold">
        Moral profile:
      </span>
      <select
        class="ml-2"
        onChange={etv(valueStr => props.onChange(parseInt(valueStr)))}
      >
        <option
          value={0}
          selected={props.value === 0}
        >
          my moral profile
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
    </NestPanel>
  )
}