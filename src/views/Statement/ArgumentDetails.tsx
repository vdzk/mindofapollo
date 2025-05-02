import { revalidate } from "@solidjs/router"
import { Component, createSignal, For, Show } from "solid-js"
import { whoCanUpdateRecord } from "~/api/update/record"
import { listForeignRecordsCache } from "~/client-only/query"
import { useBelongsTo } from "~/client-only/useBelongsTo"
import { Button } from "~/components/buttons"
import { Detail } from "~/components/details"
import { Form } from "~/components/form/Form"
import { Subtitle } from "~/components/PageTitle"
import { schema } from "~/schema/schema"
import { DataRecordWithId } from "~/schema/type"
import { getExtTableName } from "~/utils/schema"
import { getToggleLabel } from "~/utils/string"

export const ArgumentDetails: Component<{
  record?: DataRecordWithId
  showForm: boolean
  setShowForm: (show: boolean) => void
  showMoreDetails: boolean
  setShowMoreDetails: (show: boolean) => void
}> = props => {
  
  const extTableName = () => props.record
    ? getExtTableName('argument', props.record) : undefined
  const canUpdateRecord = () => useBelongsTo(
    whoCanUpdateRecord('argument', false, false))


  return (
    <div class="flex-2 min-w-0">
      <Subtitle>Argument</Subtitle>
      <Show when={props.record && extTableName()}>
          <For each={Object.keys(schema.tables[extTableName()!].columns)}>
            {colName => (
              <Detail
                tableName={extTableName()!}
                colName={colName}
                record={props.record!}
              />
            )}
          </For>
          <div class="px-2 pt-2 pb-2 flex gap-2">
            <Show when={canUpdateRecord()}>
              <Button
                label={getToggleLabel(props.showForm, 'edit')}
                onClick={() => props.setShowForm(!props.showForm)}
              />
              <Button
                label={getToggleLabel(props.showMoreDetails, 'details')}
                onClick={() => props.setShowMoreDetails(!props.showMoreDetails)}
              />
            </Show>
          </div>
        </Show>
    </div>
  )
}