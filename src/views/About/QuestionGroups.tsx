import { Component, For } from "solid-js"
import { Subtitle } from "~/components/PageTitle"
import { QuestionGroup } from "./QuestionGroup"

export const QuestionGroups: Component<{
  groups: QuestionGroup[]
  stackView?: boolean
}> = props => {
  return (
    <div
      class="flex flex-col flex-3"
      classList={{
        'border-t': props.stackView,
        'max-w-sm': !props.stackView
      }}
    >
      <div class="border-b shrink-0">
        <Subtitle>{props.stackView ? 'All questions' : 'About'}</Subtitle>
      </div>
      <div classList={{
        "flex-1 min-h-0 overflow-y-auto [scrollbar-gutter:stable] pb-4": !props.stackView
      }}>
        <For each={props.groups}>
          {group => <QuestionGroup
            group={group}
          />}
        </For>
      </div>
    </div>
  )
}