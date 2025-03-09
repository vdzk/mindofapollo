import { Component, For, Show } from "solid-js"
import { DataRecord } from "~/schema/type"
import { firstCap, humanCase } from "~/utils/string"
import { ExplRecordDetails } from "./ExplRecordDetails"
import { Subtitle } from "../PageTitle"

export const RecordByTable: Component<{
  records: Record<string, DataRecord[]>
  showExplLink?: boolean
}> = (props) => {
  return (
    <Show when={props.records && Object.keys(props.records).length > 0}>
      <For each={Object.entries(props.records)}>
        {([tableName, records]) => (
          <>
            <Subtitle>
              {firstCap(humanCase(tableName))}
            </Subtitle>
            <For each={records}>
              {(record) => <ExplRecordDetails
                tableName={tableName}
                record={record}
                showExplLink={props.showExplLink}
              />}
            </For>
          </>
        )}
      </For>
    </Show>
  )
}
