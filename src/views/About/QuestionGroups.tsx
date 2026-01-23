import { Title } from "@solidjs/meta"
import { useSearchParams } from "@solidjs/router"
import { Component, createResource, For } from "solid-js"
import { Subtitle } from "~/components/PageTitle"
import { QuestionGroup } from "./QuestionGroup"


const headerPrefix = '# '

export const QuestionGroups: Component<{
  visitedSections: string[]
}> = props => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [questionGroups] = createResource(async () => {
    const response = await fetch('/about/question_groups.md')
    const raw = await response.text()
    const lines = raw.split('\n')
    const byName: Record<string, QuestionGroup> = {}
    const byQuestion: Record<string, QuestionGroup> = {}
    let currentGroup: QuestionGroup | null = null
    let firstQuestion = null
    for (const rawLine of lines) {
      const line = rawLine.trim()
      if (line.startsWith(headerPrefix)) {
        const name = line.slice(headerPrefix.length)
        currentGroup = {
          name: line.slice(headerPrefix.length),
          questions: []
        }
        byName[name] = currentGroup
      } else if (line && currentGroup) {
        currentGroup.questions.push(line)
        byQuestion[line] = currentGroup
        firstQuestion = firstQuestion ?? line
      }
    }
    if (!searchParams.q && firstQuestion) {
      setSearchParams({ q: firstQuestion }, { replace: true })
    }
    const openQuestion = searchParams.q ?? firstQuestion
    if (typeof openQuestion === 'string') {
      byQuestion[openQuestion].startsOpen = true
    }
    return { byName, byQuestion }
  })

  return (
    <div class="flex flex-col h-full w-sm">
      <Title>{searchParams.q ?? 'About'}</Title>
      <div class="border-b shrink-0">
        <Subtitle>About</Subtitle>
      </div>
      <div class="flex-1 min-h-0 overflow-y-auto [scrollbar-gutter:stable]">
        <For each={Object.keys(questionGroups()?.byName ?? {})}>
          {groupName => <QuestionGroup
            group={questionGroups()?.byName[groupName]!}
          />}
        </For>
      </div>
    </div>
  )
}