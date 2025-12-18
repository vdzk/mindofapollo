import { action, json, useAction } from "@solidjs/router"
import { Component, ComponentProps, createSignal, JSXElement, Show } from "solid-js"
import { DataRecordWithId } from "~/schema/type"
import { Button } from "../buttons"
import { Link } from "../Link"
import { NestPanel } from "../NestPanel"
import { UserExplField } from "../form/UserExplField"
import { getAggregateRecordsCache } from "./Aggregate"
import { deleteById } from "~/api/delete/byId"

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
  itemId: number
  itemLabel: string | JSXElement
  linkProps: ComponentProps<typeof Link>
  canDelete: boolean
  hideControls?: boolean
  onDelete?: (itemId: number, userExpl: string) => void
}> = (props) => {
  const [showDelete, setShowDelete] = createSignal(false)
  const [userExpl, setUserExpl] = createSignal('')

  const _delete = useAction(deleteAction);
  const onDelete = () => _delete(
    props.tableName,
    props.recordId,
    props.aggregateName,
    props.itemTable,
    props.itemId,
    userExpl()
  )

  return (
    <>
      <Show when={showDelete()}>
        <NestPanel title="Remove">
          {props.itemLabel}
          <div class="h-2" />
          <UserExplField value={userExpl()} onChange={setUserExpl} />
          <div class="flex gap-2">
            <Button
              label="Cancel"
              onClick={() => setShowDelete(false)}
            />
            <Button
              label="Remove"
              onClick={props.onDelete
                ? () => props.onDelete!(props.itemId, userExpl())
                : onDelete}
            />
          </div>
        </NestPanel>
      </Show>
      <Show when={!showDelete()}>
        <div class="flex mb-1">
          <Link
            label={props.itemLabel}
            class="flex-1"
            {...props.linkProps}
          />
          <Show when={props.canDelete && !props.hideControls}>
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
