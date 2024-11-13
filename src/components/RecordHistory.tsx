import { createAsync } from "@solidjs/router";
import { Component, createSignal, For, Show } from "solid-js";
import { listRecordHistory } from "~/server/history.db";
import { timeAgo } from "~/util";

const HistoryList: Component<{
  tableName: string,
  recordId: number,
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

export const RecordHistory: Component<{
  tableName: string,
  recordId: number,
}> = props => {
  const [open, setOpen] = createSignal(false)

  return (
    <section class="pb-2">
      <div>
        <span class="px-2 font-bold">History</span>
        <button
          onClick={() => setOpen(val => !val)}
          class="text-sky-800"
          title="open / close"
        >
          [ {open() ? 'Λ' : 'V'} ]
        </button>
      </div>
      <Show when={open()}>
        <HistoryList {...props} />
      </Show>
    </section>
  )
}