import { Title } from "@solidjs/meta"
import { createAsync, query } from "@solidjs/router"
import { For, Match, Switch } from "solid-js"
import { listRecentActivity } from "~/api/list/recentActivity"
import { Link } from "~/components/Link"
import { PageTitle } from "~/components/PageTitle"
import { getExplSummaryStr } from "~/components/expl/Expl"

const getRecentActivityQuery = query(listRecentActivity, 'getRecentActivity')

export default function RecentActivity() {
  const activity = createAsync(() => getRecentActivityQuery())

  return (
    <main>
      <Title>Recent Activity</Title>
      <PageTitle>Recent Activity</PageTitle>
      <div class="px-2">
        <For each={activity()}>
          {(explRecord) => (
            <div class="mb-2">
              <span class="text-sm text-gray-500">
                {explRecord.timestamp.toISOString().split('.')[0].replace('T', ' ')}
              </span>
              {' '}
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
    </main>
  )
}