import { createMediaQuery } from "@solid-primitives/media"
import { createAsync, revalidate } from "@solidjs/router"
import { Component, createMemo, createSignal, For, Show } from "solid-js"
import { getOneRecordByIdCache, listForeignRecordsCache, listRecordsCache } from "~/client-only/query"
import { Button } from "~/components/buttons"
import { Detail } from "~/components/details"
import { Form } from "~/components/form/Form"
import { MasterDetail } from "~/components/MasterDetail"
import { H2 } from "~/components/PageTitle"
import { tableStyle } from "~/components/table"
import { firstCap, getToggleLabel, humanCase } from "~/utils/string"

export const CreateArgument: Component<{
  id: number
}> = props => {
  const [selectedArgumentTypeId, setSelectedArgumentTypeId] = createSignal<number | undefined>()
  const [showExamples, setShowExamples] = createSignal(false)
  const argumentTypes = createAsync(() => listRecordsCache('argument_type'))
  const argumentType = createAsync(async () => selectedArgumentTypeId()
    ? getOneRecordByIdCache('argument_type', selectedArgumentTypeId()!)
    : undefined
  )
  const examples = createAsync(async () => selectedArgumentTypeId()
    ? listForeignRecordsCache('argument_type_example', 'argument_type_id', selectedArgumentTypeId()!)
    : undefined
  )
  const options = createMemo(() => (argumentTypes() ?? []).map(type => ({
    id: type.id,
    label: firstCap(humanCase(type.name as string))
  })).sort((a, b) => a.label.localeCompare(b.label)))

  const onFormExit = (id?: number) => {
    if (id) {
      revalidate(listForeignRecordsCache.keyFor('argument', 'statement_id', props.id))
      setSelectedArgumentTypeId()
    } else {
      setSelectedArgumentTypeId(undefined)
    }
  }
  const isLarge = createMediaQuery('(min-width: 1200px)')
  return (
    <div class="flex-1 flex" classList={{'flex-col': !isLarge()}}>
      <div classList={{ "max-w-(--breakpoint-md) shrink-0 grow-0" : isLarge()}}>
        <div class="font-bold px-2">Temporary draft (optional)</div>
        <div class="px-2">
          Write the argument in your own words before making it more formal. This draft will not be saved.
          <textarea class="border w-full pl-1" rows={3} />
        </div>
        <div class="font-bold px-2 pt-1">Argument type</div>
        <MasterDetail
          options={options()}
          selectedId={selectedArgumentTypeId()}
          onChange={setSelectedArgumentTypeId}
          class="pl-1"
          optionsClass="max-w-[428px] pb-4"
          pills
        >
          <Show when={argumentType()}>
            <div class="-mt-6" />
            <Detail
              tableName="argument_type"
              colName="description"
              record={argumentType()!}
            />
            <div class="px-2 pb-2">
              <Show when={examples()?.length ?? 0 > 0}>
                <Button
                  label={getToggleLabel(showExamples(), 'examples')}
                  onClick={() => setShowExamples(x => !x)}
                />
              </Show>
            </div>
          </Show>
        </MasterDetail>
        <Show when={showExamples()}>
          <H2>Examples</H2>
          <table class="ml-2 mb-4">
            <thead>
              <tr class={tableStyle.tHeadTr}>
                <th class={tableStyle.th}>Argument</th>
                <th class={tableStyle.th}>Conclusion</th>
              </tr>
            </thead>
            <tbody>
              <For each={examples()}>
                {example => (
                  <tr>
                    <td class={tableStyle.td}>
                      {example.argument}
                    </td>
                    <td class={tableStyle.td}>
                      {example.conclusion}
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </Show>
      </div>
      <Show when={selectedArgumentTypeId()}>
        <div class="border-l flex-1">
          <Form
            tableName="argument"
            preset={{
              statement_id: props.id,
              argument_type_id: selectedArgumentTypeId()!
            }}
            exitSettings={{ onExit: onFormExit }}
            hideColumns={['statement_id', 'argument_type_id']}
          />
        </div>
      </Show>
    </div>
  )
}