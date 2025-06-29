import { action, redirect, useAction } from "@solidjs/router"
import { Component, createSignal } from "solid-js"
import { deleteById } from "~/api/delete/byId"
import { listRecordsCache } from "~/client-only/query"
import { Subtitle } from "../PageTitle"
import { UserExplField } from "./UserExplField"
import { Button } from "../buttons"

const deleteAction = action(async (
  tableName: string,
  id: number,
  userExpl: string
) => {
  await deleteById(tableName, id, userExpl)
  throw redirect(
    '/home-page',
    { revalidate: listRecordsCache.keyFor(tableName) }
  )
})

export const DeleteRecord: Component<{
  tableName: string
  id: number
}> = props => {
  const [userExpl, setUserExpl] = createSignal('')
  const _delete = useAction(deleteAction)
  const onDelete = () => _delete(props.tableName, props.id, userExpl())
  return (
    <>
      <Subtitle>Delete</Subtitle>
      <div class="px-2 max-w-(--breakpoint-sm)">
        <UserExplField value={userExpl()} onChange={setUserExpl} />
        <Button
          label="Delete"
          onClick={onDelete}
        />
      </div>
    </>
  )
}