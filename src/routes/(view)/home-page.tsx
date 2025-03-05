import { Title } from "@solidjs/meta"
import { createAsync, query } from "@solidjs/router"
import { createSignal, For } from "solid-js"
import { listHomePageStatements } from "~/api/list/homePageStatements"
import { getRecords } from "~/client-only/query"
import { Link, Links } from "~/components/Link"
import { MasterDetail } from "~/components/MasterDetail"
import { Subtitle } from "~/components/PageTitle"
import { etv } from "~/util"

const getHomePageStatementsQuery = query(listHomePageStatements, 'getHomePageStatements')

export default function HomePage() {
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
  const statements = createAsync(() => getHomePageStatementsQuery(featured(), tagId()))

  return (
    <main>
      <Title>Home Page</Title>
      <div class="h-3" />
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
                <div>
                  <Link
                    label={statement.label}
                    route="show-record"
                    params={{
                      tableName: statement.directive ? 'directive' : 'statement',
                      id: statement.id
                    }}
                  />
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
      <Subtitle>Things to do</Subtitle>
      <div class="px-2 pb-6">
        <Links
          type="button"
          links={[
            {
              label: "Tasks",
              route: "list-tasks"
            },
            {
              label: "My directives",
              route: "show-directive"
            },
            {
              label: "Invites",
              route: "list-records",
              params: { tableName: 'invite' }
            },
            {
              label: "Chat",
              route: "chat"
            }
          ]}
        />
      </div>
      <Subtitle>Other</Subtitle>
      <div class="px-2">
        <Links
          type="button"
          links={[
            {
              label: "Tables",
              route: "list-tables",
              params: { tableName: 'statement' }
            },
            {
              label: "Sandboxes",
              route: "list-sandboxes",
              params: { tableName: 'directive' }
            },
            {
              label: "Recent activity",
              route: "recent-activity"
            }
          ]}
        />
      </div>
    </main>
  )
}
