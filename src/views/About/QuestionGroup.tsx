import { Component, createSignal, For, Show } from "solid-js"
import { AboutLink } from "./AboutLink"
import { useSearchParams } from "@solidjs/router"

export interface QuestionGroup {
  name: string
  questions: string[]
}

export const QuestionGroup: Component<{
  group: QuestionGroup
  startsOpen: boolean
}> = props => {
  const [searchParams] = useSearchParams()
  const [isOpen, setIsOpen] = createSignal(props.startsOpen)
  return (
    <>
      <div
        class="hover:bg-orange-200 text-lg px-2 py-0.5 cursor-pointer flex justify-between"
        onClick={() => setIsOpen(!isOpen())}
      >
        <div>
          {props.group.name}
        </div>
        <div>
          {isOpen() ? '−' : '+'}
        </div>
      </div>
      <Show when={isOpen()}>
        <div class="ml-2 border-l border-gray-500">
          <For each={props.group.questions}>
            {question => <AboutLink
              label={question}
              question={question}
              selected={question === searchParams.q}
            />}
          </For>
        </div>
      </Show>
    </>
  )
}