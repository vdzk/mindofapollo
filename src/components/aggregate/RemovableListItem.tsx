import { action, json, useAction } from "@solidjs/router"
import { Component, ComponentProps, createSignal, Show } from "solid-js"
import { useBelongsTo } from "~/client-only/useBelongsTo"
import { useOfSelf } from "~/client-only/useOfSelf"
import { DataRecordWithId } from "~/schema/type"
import { Button } from "../buttons"
import { Link } from "../Link"
import { NestPanel } from "../NestPanel"
import { UserExplField } from "../form/UserExplField"
import { getAggregateRecordsCache } from "./Aggregate"
import { deleteById, whoCanDeleteById } from "~/api/delete/byId"

const deleteAction = action(async (
  tableName: string,
  recordId: number,
  aggregateName: string,
  itemTable: string,
  itemId: number,
  userExpl: string
) => {
  await deleteById(itemTable, itemId, userExpl)
  return json('ok', {
    revalidate: [
      getAggregateRecordsCache.keyFor(tableName, recordId, aggregateName)
    ]
  })
})

export const RemovableListItem: Component<{
  tableName: string
  recordId: number
  aggregateName: string
  itemTable: string
  item: DataRecordWithId
  text: string
  linkProps: ComponentProps<typeof Link>
  hideControls?: boolean
}> = (props) => {
  const [showDelete, setShowDelete] = createSignal(false)
  const [userExpl, setUserExpl] = createSignal('')

  const canDeleteById = () => useBelongsTo(whoCanDeleteById(
    props.itemTable,
    useOfSelf(props.itemTable, props.item)
  ))

  const _delete = useAction(deleteAction);
  const onDelete = () => _delete(
    props.tableName,
    props.recordId,
    props.aggregateName,
    props.itemTable,
    props.item.id,
    userExpl()
  )

  return (
    <>
      <Show when={showDelete()}>
        <NestPanel title="Remove">
          {props.text}
          <div class="h-2" />
          <UserExplField value={userExpl()} onChange={setUserExpl} />
          <div class="flex gap-2">
            <Button
              label="Cancel"
              onClick={() => setShowDelete(false)}
            />
            <Button
              label="Remove"
              onClick={onDelete}
            />
          </div>
        </NestPanel>
      </Show>
      <Show when={!showDelete()}>
        <div class="flex my-1">
          <Link
            label={props.text}
            class="flex-1"
            {...props.linkProps}
          />
          <Show when={canDeleteById() && !props.hideControls}>
            <Button
              label="X"
              onClick={() => setShowDelete(true)}
              tooltip="Remove"
              class="text-sm self-start ml-1"
            />
          </Show>
        </div>
      </Show>
    </>
  )
}
