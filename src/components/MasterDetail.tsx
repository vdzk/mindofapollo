import { createMediaQuery } from "@solid-primitives/media"
import { For, JSXElement, Show, createMemo } from "solid-js"
import { Option } from "~/types"

export const MasterDetail = <TId, TGroupId>(props: {
  options: Option<TId, TGroupId>[]
  selectedId?: TId
  onChange: (id?: TId) => void
  children: JSXElement
  class?: string
  optionsClass?: string
  groups?: Option<TGroupId>[]
  horizontal?: boolean
  extraPanel?: JSXElement
}) => {
  const hasGroups = () => !!props.groups && props.groups.length > 0
  const groupsById = createMemo(() => props.groups && Object.fromEntries(props.groups.map(g => [g.id, g])))
  const isLarge = createMediaQuery('(min-width: 1024px)')
  const horizontal = () => props.horizontal || !isLarge()

  const groupedOptions = createMemo(() => {
    if (hasGroups()) {
      const grouped: Record<string, Option<TId, TGroupId>[]> = Object.fromEntries(props.groups!.map(g => [String(g.id), []]))
      for (const option of props.options) {
        grouped[option.groupId + ''].push(option)
      }
      return grouped
    } else {
      return { all: props.options }
    }
  })

  const optionClassList = (optionid: TId, index: number, optionsLength: number) => {
    const isSelected = optionid === props.selectedId
    const first = index === 0
    const last = index === optionsLength - 1
    const hz = horizontal()
    return {
      'cursor-default bg-yellow-600 hover:bg-yellow-600 text-white': isSelected,
      'bg-yellow-400 hover:bg-yellow-500 text-gray-900': !isSelected,
      'rounded-l-md': hz && first,
      'rounded-r-md': hz && last,
      'rounded-t-md': !hz && first,
      'rounded-b-md': !hz && last
    }
  }

  const onOptionClick = (optionId: TId) => {
    if (optionId === props.selectedId) {
      props.onChange(undefined)
    } else {
      props.onChange(optionId)
    }
  }

  return (
    <div 
      class="flex flex-1"
      classList={{
        "flex-col": horizontal(),
        [props.class || '']: !!props.class
      }}
    >
      <div class={props.optionsClass} classList={{
        "w-full flex flex-col mb-2 px-2": horizontal(),
        "shrink-0": !horizontal()
      }}>
        <For each={Object.entries(groupedOptions())}>
          {([groupId, options]) => (
            <div classList={{
              "flex flex-wrap mb-1": horizontal(),
              "mb-0": !horizontal()
            }}>
              <Show when={hasGroups()}>
                <div classList={{
                  "font-medium": true,
                  "mr-2 self-center": horizontal(),
                  "pb-1": !horizontal()
                }}>
                  {groupsById()[groupId].label}
                </div>
              </Show>
              <div classList={{
                "flex flex-wrap": horizontal()
              }}>
                <For each={options}>
                  {(option, index) => (
                    <div
                      class="px-2 py-1 cursor-pointer"
                      classList={optionClassList(option.id, index(), options.length)}
                      onClick={() => onOptionClick(option.id)}
                    >
                      {option.label}
                    </div>
                  )}
                </For>
              </div>
              <Show when={hasGroups() && !horizontal()}>
                <div class="h-4" />
              </Show>
            </div>
          )}
        </For>
        {props.extraPanel}
      </div>
      <div
        class="flex-1 flex flex-col"
        classList={{'border-t': horizontal()}}
      >
        {props.children}
      </div>
    </div>
  )
}