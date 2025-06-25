import { createAsync, useAction } from "@solidjs/router"
import { createSignal, For, Show } from "solid-js"
import { getHomePageStatementsCache, listRecordsCache } from "~/client-only/query"
import { Link, Links } from "~/components/Link"
import { MasterDetail } from "~/components/MasterDetail"
import { Subtitle } from "~/components/PageTitle"
import { setSubscriptionAction } from "~/client-only/action"
import { Button } from "~/components/buttons"

export default function Statements() {
  const tags = createAsync(() => listRecordsCache('tag'))

  const featuredOption = { id: -1, label: 'featured' }
  const tagOptions = () => tags()?.map(
    tag => ({ id: tag.id, label: tag.name as string })
  ) ?? []
  const options = () => [featuredOption, ...tagOptions()]

  const [selectedId, setSelectedId] = createSignal(featuredOption.id)

  const featured = () => selectedId() === featuredOption.id
  const tagId = () => featured() ? undefined : selectedId()
  const statements = createAsync(() => getHomePageStatementsCache(featured(), tagId()))

  const setSubscription = useAction(setSubscriptionAction)

  return (
    <div class="flex-4 pt-2">
      <Subtitle>Statements</Subtitle>
      <div class="px-2">
        <MasterDetail
          options={options()}
          selectedId={selectedId()}
          onChange={setSelectedId}
        >
          <div class="pt-1 pl-2">
            <For each={statements()}>
              {statement => (
                <div class="flex items-center gap-2">
                  <Link
                    label={statement.label}
                    route={featured() ? 'dialogue' : 'show-record'}
                    params={featured() ? {id: statement.id} : {
                      tableName: statement.directive ? 'directive' : 'statement',
                      id: statement.id
                    }}
                    class="flex-1"
                  />
                  {!statement.directive && (
                    <Button
                      label={statement.subscribed ? 'unsub' : 'sub'}
                      onClick={() => setSubscription(statement.id, !statement.subscribed)}
                      leading={5}
                      class="text-sm"
                    />
                  )}
                </div>
              )}
            </For>
          </div>
        </MasterDetail>
      </div>
      <div class="px-2 mt-3 pb-6">
        <Links
          type="button"
          links={[
            {
              label: "Show all",
              route: "list-records",
              params: { tableName: 'statement' }
            },
            {
              label: "Add new",
              route: "create-record",
              params: { tableName: 'statement' }
            }
          ]}
        />
      </div>
    </div>
  )
}