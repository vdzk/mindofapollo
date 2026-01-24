import { createMediaQuery } from "@solid-primitives/media"
import { Title } from "@solidjs/meta"
import { useSearchParams } from "@solidjs/router"
import { createResource, Match, Show, Switch } from "solid-js"
import { Link } from "~/components/Link"
import { AboutSection } from "~/views/About/AboutSection"
import { QuestionGroup } from "~/views/About/QuestionGroup"
import { QuestionGroups } from "~/views/About/QuestionGroups"

const groupPrefix = '# '
const questionPrefix = '## '
const relatedPrefix = '+ '

export default function About() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [doc] = createResource(async () => {
    const response = await fetch('/about.md')
    const raw = await response.text()
    const lines = raw.split('\n')

    const groups: QuestionGroup[] = []
    let group: QuestionGroup | null = null
    let foundOpenQuestion = false
    const sections: Record<string, AboutSection> = {}
    let section: AboutSection | null = null
    let firstSection = true
    let inAnswer = false

    for (const rawLine of lines) {
      const line = rawLine.trimEnd()
      if (line.startsWith(groupPrefix)) {
        const name = line.slice(groupPrefix.length)
        group = {
          name,
          questions: []
        }
        groups.push(group)
      } else if (!group) {
        continue
      } else if (line.startsWith(questionPrefix)) {
        const question = line.slice(questionPrefix.length)
        if (!foundOpenQuestion) {
          if (!searchParams.q) {
            setSearchParams({ q: question }, { replace: true })
          }
          if (!searchParams.q || (question === searchParams.q)) {
            group.startsOpen = true
            foundOpenQuestion = true
          }
        }
        group.questions.push(question)
        if (sections[question]) {
          // This section was added earlier. This is just a group link.
          section = null
        } else {
          section = {
            question,
            answer: '',
            questions: []
          }
          if (firstSection) {
            section.first = true
            firstSection = false
          }
          sections[question] = section
          inAnswer = true
        }
      } else if (!section) {
        continue
      } else if (line.startsWith(relatedPrefix)) {
        const relatedQuestion = line.slice(relatedPrefix.length)
        section.questions.push(relatedQuestion)
        if (inAnswer) {
          inAnswer = false
        }
      } else if (inAnswer) {
        if (section.answer) {
          section.answer += '\n'
        }
        section.answer += line
      }
    }

    // validate relations
    const allQuestions = Object.keys(sections)
    const unrelatedQuestions = new Set(allQuestions)
    const brokenRelations: string[] = []
    for (const section of Object.values(sections)) {
      for (const relatedQuestion of section.questions) {
        if (allQuestions.includes(relatedQuestion)) {
          unrelatedQuestions.delete(relatedQuestion)
        } else {
          brokenRelations.push(relatedQuestion)
        }
      }
    }
    if (brokenRelations.length > 0) {
      console.log('Broken relations:', brokenRelations)
    }
    if (unrelatedQuestions.size > 0) {
      console.log('Unrelated questions:', unrelatedQuestions)
    }

    return { groups, sections }
  })

  const stackView = createMediaQuery('(max-width: 859px)')

  const section = () => {
    if (doc() && typeof searchParams.q === 'string') {
      return doc()!.sections[searchParams.q]
    }
  }

  return (
    <Show when={doc()}>
      <Title>{searchParams.q ?? 'About'}</Title>
      <Switch>
        <Match when={stackView() && searchParams.all}>
          <main class="flex-1 min-h-0 flex overflow-hidden flex-col overflow-y-auto">
            <QuestionGroups groups={doc()!.groups} stackView />
          </main>
        </Match>
        <Match when={stackView() && !searchParams.all}>
          <AboutSection section={section()} stackView />
          <div class="px-2 py-2 border-t">
            <Link
              label="All questions"
              route="about"
              params={{
                all: true,
                q: searchParams.q
              }}
              type="heroButton"
            />
          </div>
        </Match>
        <Match when>
          <main class="flex-1 min-h-0 flex">
            <QuestionGroups groups={doc()!.groups} />
            <AboutSection section={section()} />
          </main>
        </Match>
      </Switch>
    </Show>
  )
}