import { For, Show, Component } from "solid-js"
import { firstCap, humanCase } from "~/utils/string"
import { HistoryLink } from "./HistoryLink"
import { Subtitle } from "../PageTitle"
import { Link } from "../Link"
import { CrossRecordData } from "~/api/insert/crossRecord"


export const ExplCrossRecord: Component<{
  target: CrossRecordData['target']
  cross: CrossRecordData['cross']
  data: Record<string, any>
  showExplLink?: boolean
}> = (props) => {
  return (
    <>
      <Subtitle>Cross reference</Subtitle>
      <For each={['target', 'cross'] as const}>
        {side => {
          const tableName = props[side].tableName
          const explId = props.data[tableName + '_id_expl_id'] as number
          return (
            <>
              <div class="font-bold mt-2 px-2">
                {firstCap(humanCase(tableName))}
              </div>
              <div class="px-2">
                <Link
                  label={props[side].label}
                  route="show-record"
                  params={{
                  tableName,
                  id: props.data[tableName + '_id']
                  }}
                />{' '}
                <Show when={props.showExplLink && explId}>
                  <HistoryLink explId={explId} />
                </Show>
              </div>
            </>
          )
        }}
      </For>
    </>
  )
}
