import { Title } from "@solidjs/meta"
import { createAsync, query } from "@solidjs/router"
import { createEffect, createSignal, For } from "solid-js"
import { getHomePageQuestions } from "~/api/view/home-page"
import { getRecords } from "~/client-only/query"
import { MasterDetail } from "~/components/MasterDetail"

const getHomePageQuestionsQuery = query(getHomePageQuestions, 'getHomePageQuestions')

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
  const questions = createAsync(() => getHomePageQuestionsQuery(featured(), tagId()))

  return (
    <main>
      <Title>Home Page</Title>
      <MasterDetail
        options={options()}
        selectedId={selectedId()}
        onChange={setSelectedId}
      >
        <div class="pl-2">
          <For each={questions()}>
            {question => (
              <div>
                <a
                  href={`/show-record?tableName=${question.directive ? 'directive' : 'question'}&id=${question.id}`}
                  class="hover:underline"
                >
                  {question.label}
                </a>
              </div>
            )}
          </For>
        </div>
      </MasterDetail>
    </main>
  )
}
