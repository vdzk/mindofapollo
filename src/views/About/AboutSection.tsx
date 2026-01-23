import { useSearchParams } from "@solidjs/router"
import { Component, createResource, For, Show } from "solid-js"
import { Subtitle } from "~/components/PageTitle"
import { AboutLink } from "./AboutLink"
import { Markdown } from "~/components/Markdown"
import { Link } from "~/components/Link"

interface AboutSection {
  question: string
  answer: string
  questions: string[]
}

const headerPrefix = '# '
const questionPrefix = '+ '

export const AboutSection: Component<{
  visitedSections: string[]
}> = props => {
  const [searchParams] = useSearchParams()
  const [sections] = createResource(async () => {
    const response = await fetch('/about/sections.md')
    const raw = await response.text()
    const lines = raw.split('\n')
    const sections: Record<string, AboutSection> = {}
    let currentSection: AboutSection | null = null
    let currentAnswerLines: string[] = []
    const addCurrentSection = () => {
      if (currentSection) {
        currentSection.answer = currentAnswerLines.join('\n')
          .replace(/\n+$/, '') // trim trailing newlines
        currentAnswerLines = []
        sections[currentSection.question] = currentSection
      }
    }
    for (const rawLine of lines) {
      const line = rawLine.trimEnd()
      if (line.startsWith(headerPrefix)) {
        addCurrentSection()
        currentSection = {
          question: line.slice(headerPrefix.length),
          answer: '',
          questions: []
        }
      } else if (!currentSection) {
        continue
      } else if (line.startsWith(questionPrefix)) {
        currentSection.questions.push(line.slice(questionPrefix.length))
      } else {
        currentAnswerLines.push(line)
      }
    }
    addCurrentSection()
    return sections
  })

  const section = () => {
    const _sections = sections()
    if (_sections && typeof searchParams.q === 'string') {
      return _sections[searchParams.q]
    }
  }

  return (
    <Show when={section()}>
      <div class="min-h-0 overflow-y-auto max-w-2xl border-l">
        <div class="border-b">
          <Subtitle>Q: {section()!.question}</Subtitle>
        </div>
        <div class="px-2 py-2 pb-10">
          <Markdown
            mdText={section()!.answer}
            class="prose-lg"
          />
          <Show when={section()!.questions.length > 0}>
            <div class="flex justify-end">
              <Link
                class="mt-6"
                label="Next ➤"
                type="heroButton"
                route="about"
                params={{q: section()!.questions[0]}}
              />
            </div>
          </Show>
        </div>
      </div>
      <div class="min-h-0 overflow-y-auto flex-1 border-l">
        <Show when={section()!.questions.length > 0}>
          <div class="border-b border-t">
            <Subtitle>Questions</Subtitle>
          </div>

          <For each={section()!.questions}>
            {question => <AboutLink
              label={question}
              question={question}
              selected={false}
              large
            />}
          </For>
        </Show>

      </div>
    </Show>
  )
}
