import { Title } from "@solidjs/meta"
import { useSearchParams } from "@solidjs/router"
import { Component, createResource, For } from "solid-js"
import { Subtitle } from "~/components/PageTitle"
import { QuestionGroup } from "./QuestionGroup"


const headerPrefix = '# '

export const QuestionGroups: Component<{
  onGroupDataLoad: (questions: string[]) => void
  stackView?: boolean
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
    let questions: string[] = []
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
        const question = line
        currentGroup.questions.push(question)
        byQuestion[question] = currentGroup
        questions.push(question)
        firstQuestion = firstQuestion ?? question
      }
    }
    if (!searchParams.q && firstQuestion) {
      setSearchParams({ q: firstQuestion }, { replace: true })
    }
    const openQuestion = searchParams.q ?? firstQuestion
    if (typeof openQuestion === 'string') {
      byQuestion[openQuestion].startsOpen = true
    }
    props.onGroupDataLoad(questions)
    return { byName, byQuestion }
  })

  return (
    <div
      class="flex flex-col flex-3"
      classList={{
        'border-t': props.stackView,
        'max-w-sm': !props.stackView
      }}
    >
      <Title>{searchParams.q ?? 'About'}</Title>
      <div class="border-b shrink-0">
        <Subtitle>{props.stackView ? 'All questions' : 'About'}</Subtitle>
      </div>
      <div classList={{
        "flex-1 min-h-0 overflow-y-auto [scrollbar-gutter:stable] pb-4": !props.stackView
      }}>
        <For each={Object.keys(questionGroups()?.byName ?? {})}>
          {groupName => <QuestionGroup
            group={questionGroups()?.byName[groupName]!}
          />}
        </For>
      </div>
    </div>
  )
}