import { Title } from "@solidjs/meta"
import { Component, For, Show } from "solid-js"
import { whoCanUpdateRecord } from "~/api/update/record"
import { useBelongsTo } from "~/client-only/useBelongsTo"
import { Button } from "~/components/buttons"
import { Detail } from "~/components/details"
import { Subtitle } from "~/components/PageTitle"
import { schema } from "~/schema/schema"
import { DataRecordWithId } from "~/schema/type"
import { argumentSideLabels } from "~/tables/argument/argument"
import { getExtTableName } from "~/utils/schema"
import { getToggleLabel } from "~/utils/string"

export const ArgumentDetails: Component<{
  id: number
  record?: DataRecordWithId
  statement?: DataRecordWithId
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
    <div class="flex-3 min-w-0">
      <Title>{props.record?.title}</Title>
      <Subtitle>Argument</Subtitle>
      <div class="border-t h-3" />
      <div class="font-bold px-2">Claim</div>
      <div class="px-2 pb-2">
        {props.statement?.text ?? props.statement?.label}
      </div>
      <div class="font-bold px-2">
        {argumentSideLabels[Number(props.record?.pro)]} Argument
      </div>
      <div class="px-2 pb-2">
        {props.record?.title}
      </div>
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