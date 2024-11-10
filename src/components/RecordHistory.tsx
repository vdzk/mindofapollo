import { createAsync } from "@solidjs/router";
import { Component, For } from "solid-js";
import { listRecordHistory } from "~/server/history.db";
import { timeAgo } from "~/util";

export const RecordHistory: Component<{
  tableName: string,
  recordId: number,
}> = props => {
  const recordHistory = createAsync(() => listRecordHistory(props.tableName, props.recordId))
  // const recordHistory = createAsync(() => listRecords(props.tableName))
  return (
    <section class="pb-2">
      <div class="px-2 font-bold">History</div>
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
    </section>
  )
}