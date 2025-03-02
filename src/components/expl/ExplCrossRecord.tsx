import { For, Show, Component } from "solid-js"
import { firstCap, humanCase } from "~/util"
import { ExplLink } from "./ExplLink"


export const ExplCrossRecord: Component<{
  tableNames: {
    target: string
    cross: string
  }
  data: Record<string, any>
  showExplLink?: boolean
}> = (props) => {
  return (
    <For each={['target', 'cross'] as const}>
      {side => {
        const tableName = props.tableNames[side]
        const explId = props.data[tableName + '_id_expl_id'] as number
        return (
          <>
            <div class="font-bold mt-2 px-2">
              {firstCap(humanCase(tableName))}
            </div>
            <div>
              {props.data[tableName + '_id']}
              <Show when={props.showExplLink && explId}>
                <ExplLink explId={explId} />
              </Show>
            </div>
          </>
        )
      }}
    </For>
  )
}
