import { Title } from "@solidjs/meta"
import { createAsync } from "@solidjs/router"
import { For, Match, Show, Suspense, Switch } from "solid-js"
import { Dynamic } from "solid-js/web"
import { getRecordById } from "~/api/shared/select"
import { getExpl } from "~/api/view/expl"
import { useSafeParams } from "~/client-only/util"
import { DetailDiff } from "~/components/details"
import { actions } from "~/components/expl/actions/actions"
import { ExplLink } from "~/components/expl/ExplLink"
import { Link } from "~/components/Link"
import { PageTitle, Subtitle } from "~/components/PageTitle"

export default function Expl() {
  const sp = useSafeParams<{ id: number }>(['id'])
  const expl = createAsync(() => getExpl(sp().id))
  const user = createAsync(async () => expl() && expl()!.userId ? getRecordById('person', expl()!.userId) : undefined)
  const title = () => `Explanation #${sp().id}`
  const diffColNames = expl() ? Object.keys(expl()!.diff.after) : []
  const component = () => actions[expl()!.action]
  return (
    <main>
      <Title>{title()}</Title>
      <PageTitle>{title()}</PageTitle>
      <Suspense>
        <Dynamic
          component={component()}
          {...expl()}
          {...expl()!.data}
        />
        <Show when={!component()}>
          Action: {expl()!.action}
        </Show>
        <Subtitle>Details</Subtitle>
        <Show when={expl()!.data.triggerLabel}>
          Trigger: {expl()!.data.triggerLabel}
          <ExplLink explId={expl()!.data.triggerExplId} />
        </Show>
        User:
        <Switch>
          <Match when={expl()!.userId}>
            <Suspense>
              <Link
                label={user()!.name}
                route="show-record"
                params={{ tableName: 'person', id: expl()!.userId }}
              />
            </Suspense>
          </Match>
          <Match when={expl()!.userId === null}>
            system
          </Match>
        </Switch>
        <br/>
        Timestamp: {expl()!.timestamp.toISOString().split('.')[0]}
        <Show when={expl()!.data.diff}>
          <Subtitle>Updates</Subtitle>
          <For each={diffColNames}>
            {colName => <DetailDiff
              tableName={expl()!.tableName}
              colName={colName}
              diff={expl()!.data.diff}
            />}
          </For>
        </Show>
      </Suspense>
    </main>
  )
}