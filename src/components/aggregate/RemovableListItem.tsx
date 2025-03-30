import { action, json, useAction } from "@solidjs/router"
import { Component, createSignal, Show } from "solid-js"
import { deleteById, whoCanDeleteById } from "~/api/delete/byId"
import { useBelongsTo } from "~/client-only/useBelongsTo"
import { useOfSelf } from "~/client-only/useOfSelf"
import { DataRecordWithId } from "~/schema/type"
import { Button } from "../buttons"
import { Link } from "../Link"
import { NestPanel } from "../NestPanel"
import { UserExplField } from "../form/UserExplField"
import { getAggregateRecordsCache } from "./Aggregate"

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
  linkRoute: string
  linkParams: Record<string, any>
}> = (props) => {
  const [showDelete, setShowDelete] = createSignal(false)
  const [userExpl, setUserExpl] = createSignal('')

  const canDeleteById = () => useBelongsTo(whoCanDeleteById(
    props.itemTable,
    useOfSelf(props.itemTable, props.item)
  ));

  const _delete = useAction(deleteAction);
  const onDelete = () => _delete(
    props.tableName,
    props.recordId,
    props.aggregateName,
    props.itemTable,
    props.item.id,
    userExpl()
  );

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
        <span class="leading-5 mb-1 inline-block">
          <Link
            route={props.linkRoute}
            params={props.linkParams}
            label={props.text}
            class="py-0.5"
          />
          <span class="mr-2" />
          <Show when={canDeleteById()}>
            <Button
              label="X"
              onClick={() => setShowDelete(true)}
              tooltip="Remove"
              class="text-sm"
            />
          </Show>
        </span>
      </Show>
    </>
  );
};
