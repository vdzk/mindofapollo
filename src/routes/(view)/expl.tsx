import { Title } from "@solidjs/meta"
import { createAsync } from "@solidjs/router"
import { For, Match, Show, Suspense, Switch } from "solid-js"
import { Dynamic } from "solid-js/web"
import { getRecordById } from "~/server-only/getRecordById"
import { getExpl } from "~/api/view/expl"
import { useSafeParams } from "~/client-only/util"
import { Detail, DetailDiff } from "~/components/details"
import { actions } from "~/components/expl/actions/actions"
import { ExplLink } from "~/components/expl/ExplLink"
import { Link } from "~/components/Link"
import { PageTitle, Subtitle } from "~/components/PageTitle"
import { DataRecord } from "~/schema/type"
import { firstCap, humanCase } from "~/util"

export default function Expl() {
  const sp = useSafeParams<{ id: number }>(['id'])
  const expl = createAsync(() => getExpl(sp().id))
  const user = createAsync(async () => expl() && expl()!.user_id ? getRecordById('person', expl()!.user_id) : undefined)
  const title = () => `Explanation #${sp().id}`
  const diffColNames = () => expl() ? Object.keys(expl()!.data.diff.after) : []
  const component = () => actions[expl()!.action]

  return (
    <main class="max-w-screen-md">
      <Title>{title()}</Title>
      <PageTitle>{title()}</PageTitle>
      <Show when={expl()}>
        <Dynamic
          component={component()}
          {...expl()}
          {...expl()!.data}
        />
        <div class="px-2">
          <Show when={!component()}>
            Action: {expl()!.action}
          </Show>
        </div>

        <Subtitle>Details</Subtitle>
        <div class="px-2">
          <Show when={expl()!.data?.triggerLabel}>
            <div>
              Trigger: {expl()!.data?.triggerLabel}
              <ExplLink explId={expl()!.data?.triggerExplId} />
            </div>
          </Show>
          User:{' '}
          <Switch>
            <Match when={expl()!.user_id}>
              <Suspense>
                <Show when={user()}>
                  <Link
                    label={user()!.name}
                    route="show-record"
                    params={{ tableName: 'person', id: expl()!.user_id }}
                  />
                </Show>
              </Suspense>
            </Match>
            <Match when={expl()!.user_id === null}>
              system
            </Match>
          </Switch>
          <br/>
          Timestamp: {expl()!.timestamp.toISOString().split('.')[0].replace('T', ' ')}
        </div>
        <Show when={expl()!.data?.insert}>
          <Subtitle>Inserts</Subtitle>
          <For each={Object.entries(expl()!.data?.insert)}>
            {([tableName, record]) => (
              <>
                <div class="font-bold mt-2 px-2">
                  {firstCap(humanCase(tableName))}
                  </div>
                <For each={Object.keys(record as DataRecord)}>
                  {colName => <Detail
                    tableName={tableName}
                    colName={colName}
                    record={record as DataRecord}
                  />}
                </For>
              </>
            )}
          </For>
        </Show>
        <Show when={expl()!.data?.diff}>
          <Subtitle>Updates</Subtitle>
          <For each={diffColNames()}>
            {colName => <DetailDiff
              tableName={expl()!.table_name}
              colName={colName}
              diff={expl()!.data?.diff}
            />}
          </For>
        </Show>
      </Show>
    </main>
  )
}