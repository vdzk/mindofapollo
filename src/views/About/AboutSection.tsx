import { useSearchParams } from "@solidjs/router"
import { Component, createResource, For, Show } from "solid-js"
import { Subtitle } from "~/components/PageTitle"
import { AboutLink } from "./AboutLink"
import { Markdown } from "~/components/Markdown"

interface AboutSection {
  question: string
  answer: string
  questions: string[]
  first?: boolean
}

const headerPrefix = '# '
const questionPrefix = '+ '

export const AboutSection: Component<{
  onSectionDataLoad: (
    sectionQuestions: string[],
    relatedQuestions: string[]
  ) => void
  stackView?: boolean
}> = props => {
  const [searchParams] = useSearchParams()
  const [sections] = createResource(async () => {
    const response = await fetch('/about/sections.md')
    const raw = await response.text()
    const lines = raw.split('\n')
    const sections: Record<string, AboutSection> = {}
    let currentSection: AboutSection | null = null
    let currentAnswerLines: string[] = []
    let first = true
    let sectionQuestions: string[] = []
    let relatedQuestions: string[] = []
    const addCurrentSection = () => {
      if (currentSection) {
        currentSection.answer = currentAnswerLines.join('\n')
          .replace(/\n+$/, '') // trim trailing newlines
        if (first) {
          currentSection.first = true
          first = false
        }
        currentAnswerLines = []
        sections[currentSection.question] = currentSection
      }
    }
    for (const rawLine of lines) {
      const line = rawLine.trimEnd()
      if (line.startsWith(headerPrefix)) {
        addCurrentSection()
        const sectionQuestion = line.slice(headerPrefix.length)
        currentSection = {
          question: sectionQuestion,
          answer: '',
          questions: []
        }
        sectionQuestions.push(sectionQuestion)
      } else if (!currentSection) {
        continue
      } else if (line.startsWith(questionPrefix)) {
        const relatedQuestion = line.slice(questionPrefix.length)
        currentSection.questions.push(relatedQuestion)
        relatedQuestions.push(relatedQuestion)
      } else {
        currentAnswerLines.push(line)
      }
    }
    addCurrentSection()
    props.onSectionDataLoad(sectionQuestions, relatedQuestions)
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
      <div classList={{
        'flex-1': props.stackView,
        'flex-4 min-h-0 max-w-2xl overflow-y-auto border-l': !props.stackView
      }}>
        <div classList={{
          "border-b": props.stackView,
          "border-b px-2": !props.stackView
        }}>
          <Subtitle>Q: {section()!.question}</Subtitle>
        </div>
        <div classList={{
          "px-2 py-2": props.stackView,
          "px-4 py-4": !props.stackView
        }}>
          <Markdown
            mdText={section()!.answer}
            classList={{ "prose-lg": !props.stackView }}
          />
        </div>
        <Show when={section()!.first && !props.stackView}>
          <div class="px-2 pt-10 text-center text-lg flex justify-center items-center gap-2 leading-5">
            <div class="text-3xl">❮</div>
            <div>
              <div>Please select the next question from</div>
              <div>one of the side panels to proceed.</div>
            </div>
            <div class="text-3xl">❯</div>
          </div>
        </Show>
      </div>
      <Show when={!props.stackView ||  section()!.questions.length > 0}>
        <div classList={{
          'border-t': props.stackView,
          'min-h-0  flex-2 overflow-y-auto border-l': !props.stackView
        }} >
          <div class="border-b">
            <Subtitle>Related questions</Subtitle>
          </div>

          <For each={section()!.questions}>
            {question => <AboutLink
              label={question}
              question={question}
              selected={false}
              large={!props.stackView}
            />}
          </For>
        </div>
      </Show>
    </Show>
  )
}
