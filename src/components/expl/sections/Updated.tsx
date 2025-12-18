import { For, Show, Component } from "solid-js"
import { ExplData } from "../types"
import { firstCap, humanCase } from "~/utils/string"
import { DetailDiff } from "~/components/details"
import { Link } from "~/components/Link"
import { Subtitle } from "~/components/PageTitle"

export const Updated: Component<ExplData> = (props) => {
  return (
    <>
      <Show when={props.diff && props.target}>
        <For each={Object.keys(props.diff!.after)}>
          {colName => <DetailDiff
            tableName={props.target!.tableName}
            colName={colName}
            diff={props.diff!}
          />}
        </For>
      </Show>
      <Show when={props.updatedRecords && Object.keys(props.updatedRecords).length > 0}>
        <div>
          <For each={Object.entries(props.updatedRecords || {})}>
            {([tableName, diffRecords]) => (
              <>
                <Subtitle>
                  Table: {firstCap(humanCase(tableName))}
                </Subtitle>
                <For each={diffRecords}>
                  {(diffRecord) => (
                    <>
                      <div class="px-2 pb-2 font-bold">
                        <Link 
                          label={`Record ID: ${diffRecord.id}`}
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
                    </>
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
