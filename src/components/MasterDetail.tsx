import { For, JSX } from "solid-js"
import { Option } from "~/types"
import { firstCap } from "~/util"

export const MasterDetail = <T,>(props: {
  options: Option<T>[]
  selectedId: T
  onChange: (id: T) => void
  children: JSX.Element
}) => {
  return (
    <div class="flex">
      <div class="shrink-0 rounded-md overflow-hidden">
        <For each={props.options}>
          {option => {
            const selected = () => option.id === props.selectedId
            return (
              <div
                class="px-2 py-1 cursor-pointer"
                classList={{
                  'cursor-default bg-yellow-600 hover:bg-yellow-600 text-white': selected(),
                  'bg-yellow-400 hover:bg-yellow-500 text-gray-900': !selected()
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