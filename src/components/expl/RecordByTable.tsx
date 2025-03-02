import { Component, For, Show } from "solid-js"
import { DataRecord } from "~/schema/type"
import { firstCap, humanCase } from "~/util"
import { ExplRecordDetails } from "./ExplRecordDetails"

export const RecordByTable: Component<{
  records: Record<string, DataRecord[]>
}> = (props) => {
  return (
    <Show when={props.records && Object.keys(props.records).length > 0}>
      <For each={Object.entries(props.records)}>
        {([tableName, records]) => (
          <>
            <div class="font-bold mt-2 px-2">
              {firstCap(humanCase(tableName))}
            </div>
            <For each={records}>
              {(record) => <ExplRecordDetails
                tableName={tableName}
                record={record}
              />}
            </For>
          </>
        )}
      </For>
    </Show>
  )
}
