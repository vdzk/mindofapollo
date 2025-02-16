import { Title } from "@solidjs/meta"
import { createAsync, query } from "@solidjs/router"
import { createSignal, For } from "solid-js"
import { getHomePageStatements } from "~/api/view/home-page"
import { getRecords } from "~/client-only/query"
import { Link, Links } from "~/components/Link"
import { MasterDetail } from "~/components/MasterDetail"
import { Subtitle } from "~/components/PageTitle"

const getHomePageStatementsQuery = query(getHomePageStatements, 'getHomePageStatements')

export default function HomePage() {
  const tags = createAsync(() => getRecords('tag'))

  const featuredOption = { id: -1, label: 'featured' }
  const tagOptions = () => tags()?.map(
    tag => ({ id: tag.id, label: tag.name })
  ) ?? []
  const options = () => [featuredOption, ...tagOptions()]

  const [selectedId, setSelectedId] = createSignal(featuredOption.id)

  const featured = () => selectedId() === featuredOption.id
  const tagId = () => featured() ? undefined : selectedId()
  const statements = createAsync(() => getHomePageStatementsQuery(featured(), tagId()))

  return (
    <main>
      <Title>Home Page</Title>
      <div class="h-3" />
      <Subtitle>Statements & directives</Subtitle>
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
      <div class="px-2 mt-2 pb-6">
        <Links 
          type="button"
          links={[
            {
              label: "All statements",
              route: "list-records",
              params: { tableName: 'statement' }
            },
            {
              label: "Add a statement",
              route: "create-record",
              params: { tableName: 'statement' }
            }
          ]}
        />
        <Links 
          type="button"
          links={[
            {
              label: "All directives",
              route: "list-records",
              params: { tableName: 'directive' }
            },
            {
              label: "Add a directive",
              route: "create-record",
              params: { tableName: 'directive' }
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
            }
          ]}
        />
      </div>
    </main>
  )
}
