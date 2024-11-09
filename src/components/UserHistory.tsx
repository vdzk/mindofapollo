import { createAsync } from "@solidjs/router";
import { Component, For } from "solid-js";
import { listUserHistory } from "~/server/history.db";
import { humanCase, timeAgo } from "~/util";

export const UserHistory: Component<{
  userId: number
}> = props => {
  const userHistory = createAsync(() => listUserHistory(props.userId))
  return (
    <section class="pb-2">
      <div class="px-2 font-bold">User history</div>
      <For each={userHistory()}>
        {opRecord => (
          <div class="px-2">
          {timeAgo.format(opRecord.op_timestamp)}
          {' '}
          {humanCase(opRecord.tableName)}
          {' '}
          {opRecord.data_op}
          {' '}
          {Object.entries(opRecord)
            .filter(([key]) => !['op_timestamp', 'data_op', 'op_user_id'].includes(key))
            .map(([key, value]) => `[${key}: ${value}]`)
            .join(' ')}
        </div>
        )}
      </For>
    </section>
  )
}