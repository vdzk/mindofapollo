import { For, JSX } from "solid-js"
import { Option } from "~/types"
import { firstCap } from "~/utils/string"

export const MasterDetail = <T,>(props: {
  options: Option<T>[]
  selectedId: T
  onChange: (id: T) => void
  children: JSX.Element
  class?: string
}) => {
  return (
    <div class={`flex ${props.class || ''}`}>
      <div class="shrink-0">
        <For each={props.options}>
          {(option, index) => {
            const selected = () => option.id === props.selectedId
            return (
              <div
                class="px-2 py-1 cursor-pointer"
                classList={{
                  'cursor-default bg-yellow-600 hover:bg-yellow-600 text-white': selected(),
                  'bg-yellow-400 hover:bg-yellow-500 text-gray-900': !selected(),
                  'rounded-t-md': index() === 0,
                  'rounded-b-md': index() === props.options.length - 1
                }}
                onClick={() => props.onChange(option.id)}
              >
                {firstCap(option.label)}
              </div>
            )
          }}
        </For>
      </div>
      <div>
        {props.children}
      </div>
    </div>
  )
}