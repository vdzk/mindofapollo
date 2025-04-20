import { createMediaQuery } from "@solid-primitives/media"
import { createAsync } from "@solidjs/router"
import { Component, For, Show, Suspense } from "solid-js"
import { listForeignRecordsCache } from "~/client-only/query"
import { Detail } from "~/components/details"
import { tableStyle } from "~/components/table"
import { DataRecordWithId } from "~/schema/type"
import { getPercent } from "~/utils/string"

const ExamplesTable: Component<{ examples: DataRecordWithId[] }> = props => {
  return (
    <table class="mt-2 mb-2 w-full">
      <thead>
        <tr class={tableStyle.tHeadTr}>
          <For each={
            ['Argument Examples', 'Conclusion', 'Explanation', 'Confidence']
          }>{(header, i) => (
            <th class={tableStyle.th + (i() === 0 ? ' pl-2' : '')}>
              {header}
            </th>
          )}</For>
        </tr>
      </thead>
      <tbody>
        <For each={props.examples}>
          {example => (
            <tr>
              <For each={['argument', 'conclusion', 'explanation']}>
                {(colName, i) => (
                  <td class={tableStyle.td + (i() === 0 ? ' pl-2' : '')}>
                    {example[colName]}
                  </td>
                )}
              </For>
              <td class={tableStyle.td}>
                {getPercent(example.grade as number)}
              </td>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  )
}

const ExamplesList: Component<{ examples: DataRecordWithId[] }> = props => {
  return (
    <For each={props.examples}>
      {example => (
        <div class="border-b mt-2 mb-2">
          <For each={['argument', 'conclusion', 'explanation', 'grade']}>
            {colName => (
              <Detail
                tableName="argument_grading_example"
                colName={colName}
                record={example}
              />
            )}
          </For>
        </div>
      )}
    </For>
  )
}

export const JudgeExamples: Component<{ argumentTypeId: number }> = props => {
  const examples = createAsync(() => listForeignRecordsCache(
    'argument_grading_example', 'argument_type_id', props.argumentTypeId
  ))
  const isLarge = createMediaQuery('(min-width: 1024px)')
  return (
    <div class="border-t">
      <Suspense>
        <Show when={examples() && examples()!.length > 0}>
          <Show when={isLarge()}>
            <ExamplesTable examples={examples()!} />
          </Show>
          <Show when={!isLarge()}>
            <ExamplesList examples={examples()!} />
          </Show>
        </Show>
        <Show when={examples() && examples()!.length === 0}>
          <div class="px-2">No examples are available.</div>
        </Show>
      </Suspense>
    </div>
  )
}