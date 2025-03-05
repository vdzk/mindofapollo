import { Component, For, Match, Switch } from "solid-js"
import { createAsync } from "@solidjs/router"
import { Link } from "./Link"
import { listRecordHistory } from "~/api/list/recordHistory"
import { getExplSummaryStr } from "./expl/Expl";

export const RecordHistory: Component<{tableName: string, id: number}> = props => {
  const history = createAsync(() => listRecordHistory(props.tableName, props.id))

  return (
    <div class="px-2">
      <For each={history()}>
        {(explRecord) => (
          <div>
            <Switch>
              <Match when={explRecord.data}>
                <Link
                  route="expl"
                  params={{ id: explRecord.id }}
                  label={getExplSummaryStr(explRecord)}
                />
              </Match>
              <Match when>
                <div>{explRecord.action}</div>
              </Match>
            </Switch>
          </div>
        )}
      </For>
    </div>
  )
}