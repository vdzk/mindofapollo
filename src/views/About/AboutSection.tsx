import { Component,  For, Show } from "solid-js"
import { Subtitle } from "~/components/PageTitle"
import { AboutLink } from "./AboutLink"
import { Markdown } from "~/components/Markdown"

export interface AboutSection {
  question: string
  answer: string
  questions: string[]
  first?: boolean
}

export const AboutSection: Component<{
  section?: AboutSection
  stackView?: boolean
}> = props => {
  return (
    <Show
      when={props.section}
      fallback={<div class="border-l"/>}
    >
      <div classList={{
        'flex-1': props.stackView,
        'flex-4 min-h-0 max-w-2xl overflow-y-auto border-l': !props.stackView
      }}>
        <div classList={{
          "border-b": props.stackView,
          "border-b px-2": !props.stackView
        }}>
          <Subtitle>Q: {props.section!.question}</Subtitle>
        </div>
        <div classList={{
          "px-2 py-2": props.stackView,
          "px-4 py-4": !props.stackView
        }}>
          <Markdown
            mdText={props.section!.answer}
            classList={{ "prose-lg": !props.stackView }}
          />
        </div>
        <Show when={props.section!.first && !props.stackView}>
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
      <Show when={!props.stackView ||  props.section!.questions.length > 0}>
        <div classList={{
          'border-t': props.stackView,
          'min-h-0  flex-2 overflow-y-auto border-l': !props.stackView
        }} >
          <div class="border-b">
            <Subtitle>Related questions</Subtitle>
          </div>

          <For each={props.section!.questions}>
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
