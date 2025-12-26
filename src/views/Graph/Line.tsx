import { For, ParentComponent } from "solid-js";
import { GraphNode } from "./buildGraph";

export interface Marker {
  short: string;
  tooltip: string;
  classStr: string;
}

export const getMarker = (node: GraphNode): Marker => {
  let short = 'XX'
  let tooltip = 'unknown type'
  let classStr = ''
  if (node.tableName === 'statement') {
    if (node.path.length === 0) {
      short = 'C'
      tooltip = 'claim'
      classStr = 'text-purple-700'
    } else {
      short = 'P'
      tooltip = 'premise'
      classStr = 'text-gray-700'
    }
  } else if (node.tableName === 'argument') {
    if (node.pro) {
      short = 'Y'
      tooltip = '(Yes) pro argument'
      classStr = 'text-green-700'
    } else {
      short = 'N'
      tooltip = '(No) con argument'
      classStr = 'text-red-700'
    }
  }
  return { short, tooltip, classStr }
}

export const stubMarker = {
  short: '⇧',
  tooltip: 'jump',
  classStr: 'text-blue-700'
}

export const Line: ParentComponent<{
  selected?: boolean
  marker: Marker
  path: number[]
  ping?: boolean
}> = props => {
  return (
    <div
      class="flex"
      classList={{ 'bg-blue-200': props.ping }}
    >
      <div
        class="w-2 shrink-0"
        classList={{
          'bg-gray-600': props.selected
        }}
      />
      <For each={props.path} >
        {(_, index) => <div
          class="w-4  border-l shrink-0"
          classList={{
            'border-gray-500': !props.selected,
            'border-gray-300 bg-gray-600': props.selected,
            '[clip-path:polygon(0_0,0_100%,80%_50%)]': index() === props.path.length - 1
          }}
        />}
      </For>
      <div
        class="font-bold pr-1"
        classList={{
          [props.marker.classStr]: !!props.marker.classStr
        }}
        title={props.marker.tooltip}
      >
        {props.marker.short}
      </div>
      {props.children}
    </div>
  )
}