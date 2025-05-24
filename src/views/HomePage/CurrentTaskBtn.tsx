import { action, json, redirect, useAction } from "@solidjs/router";
import { Component } from "solid-js";
import { getOneCurrentTaskId } from "~/api/getOne/currentTaskId";
import { Button } from "~/components/buttons";
import { buildUrl } from "~/utils/schema";

const goToTaskAction = action(async () => {
  const issueId = await getOneCurrentTaskId()
  if (issueId) {
    throw redirect(buildUrl({route: 'show-record', params: {tableName: 'issue', id: issueId}}))
  } else {
    return json('No current task found', { status: 404 })
  }
})

export const CurrentTaskBtn: Component = () => {
  const goToTask = useAction(goToTaskAction)
  const onClick = async () => {
    const message = await goToTask()
    if (message) {
      alert(message)
    }
  }
  return (
    <Button
      label="Current task"
      {...{onClick}}
    />
  )
}