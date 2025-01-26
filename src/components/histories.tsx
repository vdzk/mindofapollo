import { createAsync } from "@solidjs/router"
import { Component, For } from "solid-js"
import { listRecordHistory, listUserHistory } from "~/api/components/histories"
import { Id } from "~/types"
import { humanCase, timeAgo } from "~/util"

export const RecordHistory: Component<{
  tableName: string,
  recordId: Id,
}> = props => {
  const recordHistory = createAsync(() => listRecordHistory(props.tableName, props.recordId))

  return (
    <For each={recordHistory()}>
      {opRecord => (
        <div class="px-2">
          {timeAgo.format(opRecord.op_timestamp)}
          {' '}
          {opRecord.op_user_name}
          {' '}
          {opRecord.data_op}
          {' '}
          {Object.entries(opRecord)
            .filter(([key]) => !['op_timestamp', 'op_user_name', 'data_op', 'id', 'op_user_id'].includes(key))
            .map(([key, value]) => `[${key}: ${value}]`)
            .join(' ')}
        </div>
      )}
    </For>
  )
}

export const UserHistory: Component<{
  userId: Id
}> = props => {
  const userHistory = createAsync(() => listUserHistory(props.userId))
  return (
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
  )
}
