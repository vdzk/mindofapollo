import { debounce } from "@solid-primitives/scheduled";
import { Component } from "solid-js";
import { etv } from "~/client-only/util";

export const UserExplField: Component<{
  value: string
  onChange: (value: string) => void
}> = props => {
  const onInput = debounce(props.onChange, 500)
  return (
    <div class="pb-2">
      <div class="font-bold">Why are you making this change?</div>
      <input
        type="text"
        class="border rounded-sm pl-1 w-full"
        autocomplete="off"
        value={props.value}
        onChange={etv(props.onChange)}
        onInput={etv(onInput)}
      />
    </div>
  )
}