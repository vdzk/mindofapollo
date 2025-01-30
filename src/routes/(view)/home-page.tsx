import { Title } from "@solidjs/meta"
import { createAsync, query } from "@solidjs/router"
import { createSignal, For } from "solid-js"
import { getHomePageStatements } from "~/api/view/home-page"
import { getRecords } from "~/client-only/query"
import { MasterDetail } from "~/components/MasterDetail"
import { PageTitle } from "~/components/PageTitle"

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
      <PageTitle>Things to do</PageTitle>
      <a href="/create-record?tableName=statement" class="ml-2 text-sky-800">[ Add a statement ]</a>
      <a href="/create-record?tableName=directive" class="ml-1 text-sky-800">[ Add a directive ]</a>
      <br/>
      <a href="/list-tasks" class="ml-2 text-sky-800">[ Tasks ]</a>
      <a href="/show-directive" class="ml-1 text-sky-800">[ Directives ]</a>
      <a href="/list-records?tableName=invite" class="ml-1 text-sky-800">[ Invites ]</a>
      <a href="/admin-tools" class="ml-1 text-sky-800">[ Administrate ]</a>
      <PageTitle>Explore</PageTitle>
      <MasterDetail
        options={options()}
        selectedId={selectedId()}
        onChange={setSelectedId}
      >
        <div class="pt-1 pl-2">
          <For each={statements()}>
            {statement => (
              <div>
                <a
                  href={`/show-record?tableName=${statement.directive ? 'directive' : 'statement'}&id=${statement.id}`}
                  class="hover:underline"
                >
                  {statement.label}
                </a>
              </div>
            )}
          </For>
        </div>
      </MasterDetail>
    </main>
  )
}
