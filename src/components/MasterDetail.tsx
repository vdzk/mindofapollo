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
      <div class="shrink-0">
        <For each={props.options}>
          {option => {
            const selected = () => option.id === props.selectedId
            return (
              <div
                class="px-2 py-1 cursor-pointer"
                classList={{
                  'cursor-default bg-transparent hover:bg-transparent': selected(),
                  'bg-gray-200 hover:bg-yellow-100': !selected()
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