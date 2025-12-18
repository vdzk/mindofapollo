import { createAsync, revalidate } from "@solidjs/router"
import { Component, createSignal, For, Show } from "solid-js"
import { deleteById } from "~/api/delete/byId"
import { listForeignRecordsCache } from "~/client-only/query"
import { RemovableListItem } from "~/components/aggregate/RemovableListItem"
import { Button, importantButtonStyle } from "~/components/buttons"
import { Form } from "~/components/form/Form"
import { Subtitle } from "~/components/PageTitle"
import { nbsp } from "~/utils/string"

export const Premises: Component<{ id: number }> = props => {
  const premises = createAsync(() => listForeignRecordsCache(
    'premise', 'argument_id', props.id, true
  ))

  const [showForm, setShowForm] = createSignal(false)
  const revalidatePremises = () => revalidate(listForeignRecordsCache.keyFor('premise', 'argument_id', props.id, true))
  const onFormExit = (savedId?: number) => {
    if (savedId) {
      revalidatePremises()
    }
    setShowForm(false)
  }

  const onDelete = async (premiseId: number, userExpl: string) => {
    await deleteById('premise', premiseId, userExpl)
    revalidatePremises()
  }

  return (
    <div class="flex-1 flex flex-col">
      <div class='flex justify-between border-b'>
        <Subtitle>Premises</Subtitle>
        <Button
          label={showForm() ? 'Show' : '➕ Add'}
          onClick={() => setShowForm(prev => !prev)}
          class={'self-center mx-1 ' + importantButtonStyle}
        />
      </div>
      <Show when={showForm()}>
        <div class='h-2' />
        <Form
          tableName="premise"
          preset={{
            argument_id: props.id
          }}
          hideColumns={['argument_id']}
          exitSettings={{ onExit: onFormExit }}
        />
      </Show>
      <Show when={!showForm()}>
        <div class="px-2 py-2 flex flex-col">
          <For each={premises()}>
            {premise => (
              <RemovableListItem
                tableName="argument"
                recordId={props.id}
                aggregateName="premises"
                itemTable="premise"
                itemId={premise.id}
                itemLabel={(
                  <>
                    <Show when={premise.invert}>
                      <span
                        title="the argument relies on the statement not being true"
                        class="font-bold opacity-50 self-center"
                      >
                        NOT
                        {nbsp}
                      </span>
                    </Show>
                    {premise.statement_label}
                  </>
                )}
                linkProps={{
                  route: 'statement',
                  params: {
                    id: premise.statement_id
                  },
                  type: 'block'
                }}
                canDelete={premise.canDelete as boolean}
                onDelete={onDelete}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}