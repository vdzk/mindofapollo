import { createAsync, useAction } from "@solidjs/router"
import { createSignal, For } from "solid-js"
import { getHomePageStatementsCache, getRecords } from "~/client-only/query"
import { Link, Links } from "~/components/Link"
import { MasterDetail } from "~/components/MasterDetail"
import { Subtitle } from "~/components/PageTitle"
import { etv } from "~/util"
import { setSubscriptionAction } from "~/client-only/action"
import { Button } from "~/components/buttons"

export default function StatementsAndDirectives() {
  const tags = createAsync(() => getRecords('tag'))

  const featuredOption = { id: -1, label: 'featured' }
  const tagOptions = () => tags()?.map(
    tag => ({ id: tag.id, label: tag.name as string })
  ) ?? []
  const options = () => [featuredOption, ...tagOptions()]

  const [selectedId, setSelectedId] = createSignal(featuredOption.id)
  const [selectedTable, setSelectedTable] = createSignal('statement')

  const featured = () => selectedId() === featuredOption.id
  const tagId = () => featured() ? undefined : selectedId()
  const statements = createAsync(() => getHomePageStatementsCache(featured(), tagId()))

  const setSubscription = useAction(setSubscriptionAction)

  return (
    <>
      <Subtitle>Statements & directives</Subtitle>
      <div class="px-2">
        <MasterDetail
          options={options()}
          selectedId={selectedId()}
          onChange={setSelectedId}
        >
          <div class="pt-1 pl-2">
            <For each={statements()}>
              {statement => (
                <div class="flex items-center">
                  <Link
                    label={statement.label}
                    route="show-record"
                    params={{
                      tableName: statement.directive ? 'directive' : 'statement',
                      id: statement.id
                    }}
                  />
                  {!statement.directive && (
                    <Button
                      label={statement.subscribed ? 'Unsub' : 'Sub'}
                      onClick={() => setSubscription(statement.id, !statement.subscribed)}
                      class="ml-2"
                    />
                  )}
                </div>
              )}
            </For>
          </div>
        </MasterDetail>
      </div>
      <div class="px-2 mt-3 pb-6">
        <select onChange={etv(setSelectedTable)} class="mr-2 rounded-md py-0.5 px-0.5 bg-gray-200">
          <option value="statement" selected={selectedTable() === 'statement'}>
            Statements
          </option>
          <option value="directive" selected={selectedTable() === 'directive'}>
            Directives
          </option>
        </select>
        <Links
          type="button"
          links={[
            {
              label: "Show all",
              route: "list-records",
              params: { tableName: selectedTable() }
            },
            {
              label: "Add new",
              route: "create-record",
              params: { tableName: selectedTable() }
            }
          ]}
        />
      </div>
    </>
  )
}