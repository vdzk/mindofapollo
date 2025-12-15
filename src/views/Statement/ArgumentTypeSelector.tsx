import { createMediaQuery } from "@solid-primitives/media"
import { createAsync, revalidate } from "@solidjs/router"
import { Component, createMemo, createSignal, For, Show } from "solid-js"
import { deleteById } from "~/api/delete/byId"
import { updateRecord } from "~/api/update/record"
import { getOneRecordByIdCache, listForeignRecordsCache, listRecordsCache } from "~/client-only/query"
import { Button } from "~/components/buttons"
import { Detail } from "~/components/details"
import { Form } from "~/components/form/Form"
import { MasterDetail } from "~/components/MasterDetail"
import { H2, Subtitle } from "~/components/PageTitle"
import { tableStyle } from "~/components/table"
import { DataRecordWithId } from "~/schema/type"
import { getExtTableName } from "~/utils/schema"
import { firstCap, getToggleLabel, humanCase } from "~/utils/string"

export const ArgumentTypeSelector: Component<{
  record: DataRecordWithId
  onFormExit: () => void
}> = props => {
  const [selectedArgumentTypeId, setSelectedArgumentTypeId] = createSignal<number>(props.record.argument_type_id as number)
  const argumentTypeChanged = () => props.record.argument_type_id !== selectedArgumentTypeId()
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

  const extTableName = () => getExtTableName('argument', undefined, undefined, selectedArgumentTypeId())

  const onExit = async (savedId?: number, userExpl?: string) => {
    if (savedId) {
      //update argument type id of the argument
      await updateRecord(
        'argument',
        props.record.id,
        { argument_type_id: selectedArgumentTypeId() },
        userExpl ?? ''
      )

      //delete old record extension
      const oldExtTableName = getExtTableName('argument', undefined, undefined, props.record.argument_type_id as number)
      if (oldExtTableName) {
        await deleteById(oldExtTableName, props.record.id, userExpl ?? '')
      }
    }
    props.onFormExit()
  }

  const isLarge = createMediaQuery('(min-width: 1200px)')
  return (
    <div class="flex-1" classList={{ 'flex-col': !isLarge() }}>
      <Subtitle>Select argument type</Subtitle>
      <div class='border-t pt-2'>
        <MasterDetail
          options={options()}
          selectedId={selectedArgumentTypeId()}
          onChange={setSelectedArgumentTypeId}
          class="pl-2"
          optionsClass="max-w-[428px] pb-4"
        >
          <Show when={argumentType()}>
            <Detail
              tableName="argument_type"
              colName="description"
              label="Type description"
              record={argumentType()!}
            />
            <Show when={examples()?.length ?? 0 > 0}>
              <div class="px-2 pb-2">
                <Button
                  label={getToggleLabel(showExamples(), 'examples')}
                  onClick={() => setShowExamples(x => !x)}
                />
              </div>
            </Show>
            <Show when={showExamples()}>
              <H2>Examples of arguments of type "{argumentType()!.name}"</H2>
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
            <Show when={argumentTypeChanged() && extTableName()}>
              <Form
                tableName={extTableName()!}
                preset={{
                  id: props.record.id
                }}
                exitSettings={{ onExit, passUserExpl: true }}
              />
            </Show>
          </Show>
        </MasterDetail>
      </div>
    </div>
  )
}