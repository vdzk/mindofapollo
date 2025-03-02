import { For, Show, Component } from "solid-js"
import { ExplData } from "../types"
import { firstCap, humanCase } from "~/util"
import { DetailDiff } from "~/components/details"
import { Link } from "~/components/Link"

export const Updated: Component<ExplData> = (props) => {
  return (
    <>
      <Show when={props.diff}>
        <div class="px-2">
          <For each={Object.keys(props.diff!.after)}>
            {colName => <DetailDiff
              tableName={props.target.tableName}
              colName={colName}
              diff={props.diff!}
            />}
          </For>
        </div>
      </Show>
      <Show when={props.updatedRecords && Object.keys(props.updatedRecords).length > 0}>
        <div>
          <For each={Object.entries(props.updatedRecords || {})}>
            {([tableName, diffRecords]) => (
              <>
                <div class="font-bold mt-2 px-2">
                  {firstCap(humanCase(tableName))}
                </div>
                <For each={diffRecords}>
                  {(diffRecord) => (
                    <div class="ml-4 my-2 p-2 border border-gray-200 rounded">
                      <div class="font-bold">
                        Record ID: {diffRecord.id}
                        <Link 
                          label="View"
                          route="show-record"
                          params={{ tableName, id: diffRecord.id }}
                        />
                      </div>
                      <For each={Object.keys(diffRecord.after)}>
                        {colName => <DetailDiff
                          tableName={tableName}
                          colName={colName}
                          diff={diffRecord}
                        />}
                      </For>
                    </div>
                  )}
                </For>
              </>
            )}
          </For>
        </div>
      </Show>
    </>
  )
}
