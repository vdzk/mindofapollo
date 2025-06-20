import { createAsync } from "@solidjs/router"
import { Component, createMemo, createSignal, For, Show } from "solid-js"
import { getOneRecordByIdCache, listForeignRecordsCache, listRecordsCache } from "~/client-only/query"
import { Button } from "~/components/buttons"
import { Detail } from "~/components/details"
import { Form } from "~/components/form/Form"
import { MasterDetail } from "~/components/MasterDetail"
import { H2, Subtitle } from "~/components/PageTitle"
import { tableStyle } from "~/components/table"
import { firstCap, getToggleLabel, humanCase } from "~/utils/string"

export const CreateArgument: Component<{
  statementId: number,
  onExit: (id?: number) => void
}> = props => {
  const [selectedArgumentTypeId, setSelectedArgumentTypeId] = createSignal<number | undefined>()
  const [showExamples, setShowExamples] = createSignal(false)
  const [argumentTypeId, setArgumentTypeId] = createSignal<number | undefined>()
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
      props.onExit(id)
    } else {
      setArgumentTypeId(undefined)
    }
  }
  return (
    <div class="flex-1 flex flex-col lg:flex-row">
      <div class="flex-1">
        <Subtitle>Temporary draft</Subtitle>
        <div class="px-2">
          (optional) Write the argument in your own words before making it more formal.
          <textarea class="border w-full pl-1" rows={10}>

          </textarea>
          This draft will not be saved.
        </div>
      </div>
      <Show when={!argumentTypeId()}>
        <div class="flex-3 border-l">
          <Subtitle>What type of argument is it?</Subtitle>
          <MasterDetail
            options={options()}
            selectedId={selectedArgumentTypeId()}
            onChange={setSelectedArgumentTypeId}
            class="pl-2"
          >
            <Show when={argumentType()}>
              <Detail
                tableName="argument_type"
                colName="description"
                record={argumentType()!}
              />
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
              <div class="px-2 pb-2">
                <Button
                  label="Select"
                  onClick={() => setArgumentTypeId(selectedArgumentTypeId())}
                />
                <Show when={examples()?.length ?? 0 > 0}>
                  <span class="inline-block w-2" />
                  <Button
                    label={getToggleLabel(showExamples(), 'examples')}
                    onClick={() => setShowExamples(x => !x)}
                  />
                </Show>
                <span class="inline-block w-2" />
                <Button
                  label="Cancel"
                  onClick={() => props.onExit()}
                />
              </div>
            </Show>
          </MasterDetail>
        </div>
      </Show>
      <Show when={argumentTypeId()}>
        <div class="border-l flex-3 pt-2">
          <Form
            tableName="argument"
            preset={{
              statement_id: props.statementId,
              argument_type_id: argumentTypeId()!
            }}
            exitSettings={{ onExit: onFormExit }}
            hideColumns={['statement_id', 'pro']}
          />
        </div>
      </Show>
    </div>
  )
}