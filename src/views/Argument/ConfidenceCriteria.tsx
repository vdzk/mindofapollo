import { createAsync } from "@solidjs/router"
import { Component, For, Show } from "solid-js"
import { listForeignRecordsCache } from "~/client-only/query"
import { tableStyle } from "~/components/table"
import { getPercent } from "~/utils/string"

export const ConfidenceCriteria: Component<{
  argumentTypeId: number
}> = props => {
  const criteria = createAsync(() => listForeignRecordsCache(
    'argument_certainty_criterion',
    'argument_type_id', props.argumentTypeId
  ))
  return (
    <Show when={criteria() && criteria()!.length > 0}>
      <table class="mt-2 mb-2">
        <thead>
          <tr class={tableStyle.tHeadTr}>
            <th class={tableStyle.th + ' pl-2 min-w-30'}>Conf. Range</th>
            <th class={tableStyle.th}>Description</th>
          </tr>
        </thead>
        <tbody>
          <For each={criteria()}>
            {criterion => (
              <tr>
                <td class={tableStyle.td + ' pl-2'}>
                  {getPercent(criterion.min_value as number)}
                  {' - '}
                  {getPercent(criterion.max_value as number)}
                </td>
                <td class={tableStyle.td}>
                  {criterion.description}
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </Show>
  )
}