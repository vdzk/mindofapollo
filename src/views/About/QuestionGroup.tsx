import { Component, createSignal, For, Show } from "solid-js"
import { AboutLink } from "./AboutLink"
import { useSearchParams } from "@solidjs/router"

export interface QuestionGroup {
  name: string
  questions: string[]
  startsOpen?: boolean
}

export const QuestionGroup: Component<{
  group: QuestionGroup
}> = props => {
  const [searchParams] = useSearchParams()
  const [isOpen, setIsOpen] = createSignal(!!props.group.startsOpen)
  return (
    <div class="mx-2 my-2 border-2 border-gray-600 rounded overflow-hidden">
      <div
        class="px-2 py-0.5 cursor-pointer flex justify-between  hover:bg-orange-200"
        classList={{
          'border-b-2 border-b-gray-600': isOpen()
        }}
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
        <div class="flex">
          <div class="flex-1">
            <For each={props.group.questions}>
              {question => <AboutLink
                label={question}
                question={question}
                selected={question === searchParams.q}
              />}
            </For>
          </div>
        </div>
      </Show>
    </div>
  )
}