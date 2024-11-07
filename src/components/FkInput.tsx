import { createAsync, useSearchParams } from "@solidjs/router";
import { Component, For, Show } from "solid-js";
import { ForeignKey } from "~/schema/type";
import { getRecords } from "~/server/api";


export const FkInput: Component<{
  colName: string,
  column: ForeignKey,
  value?: any
}> = (props) => {
  const [searchParams] = useSearchParams()
  const records = createAsync(() => getRecords(props.column.fk.table))

  return (
    <select
      name={props.colName}
      class="max-w-full"
      disabled={props.value && props.column.fk.extensionTables}
    >
      <Show when={props.value === undefined}>
        <option></option>
      </Show>
      <For each={records()}>
        {record => (
          <option
            value={record.id}
            selected={record.id === props.value || record.id + '' === searchParams[props.colName]}
          >
            {record[props.column.fk.labelColumn]}
          </option>
        )}
      </For>
    </select>
  );
};
