import { revalidate } from "@solidjs/router"
import { Component, createSignal, For, Show } from "solid-js"
import { whoCanUpdateRecord } from "~/api/update/record"
import { _delete } from "~/client-only/action"
import { listForeignRecordsCache } from "~/client-only/query"
import { useBelongsTo } from "~/client-only/useBelongsTo"
import { Button } from "~/components/buttons"
import { Detail } from "~/components/details"
import { Form } from "~/components/form/Form"
import { Subtitle } from "~/components/PageTitle"
import { schema } from "~/schema/schema"
import { DataRecordWithId } from "~/schema/type"
import { getExtTableName } from "~/utils/schema"

export const ArgumentDetails: Component<{
  record?: DataRecordWithId
  showMoreDetails: boolean
  setShowMoreDetails: (show: boolean) => void
}> = props => {
  const [showForm, setShowForm] = createSignal(false)
  const extTableName = () => props.record
    ? getExtTableName('argument', props.record) : undefined
  const canUpdateRecord = () => useBelongsTo(
    whoCanUpdateRecord('argument', false, false))
  const onFormExit = () => {
    setShowForm(false)
    revalidate([
      listForeignRecordsCache.keyFor('argument', 'statement_id', props.record!.statement_id as number)
    ])
  }

  return (
    <div class="flex-2">
      <Subtitle>Details</Subtitle>
      <Show when={props.record && extTableName()}>
        <Show when={showForm()}>
          <Form
            tableName={'argument'}
            exitSettings={{ onExit: onFormExit }}
            id={props.record!.id}
            record={props.record}
          />
        </Show>
        <Show when={!showForm()}>
          <For each={Object.keys(schema.tables[extTableName()!].columns)}>
            {colName => (
              <Detail
                tableName={extTableName()!}
                colName={colName}
                record={props.record!}
              />
            )}
          </For>
          <div class="px-2 pt-2 flex gap-2">
            <Show when={canUpdateRecord()}>
              <Button
                label="Edit"
                onClick={() => setShowForm(true)}
              />
              <Button
                label={props.showMoreDetails
                  ? "Hide more details"
                  : "Show more details"
                }
                onClick={() => props.setShowMoreDetails(!props.showMoreDetails)}
              />
            </Show>
          </div>
        </Show>
      </Show>
    </div>
  )
}