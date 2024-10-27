import { createAsync, useSearchParams } from "@solidjs/router";
import { Component, For, Show, useContext } from "solid-js";
import { ForeignKey } from "~/schema/type";
import { getRecords } from "~/server/api";
import { ExtensionTableContext } from "./Form";
import { etv } from "~/util";


export const FkInput: Component<{
  colName: string,
  column: ForeignKey,
  value?: any
}> = (props) => {
  const setExtTableSuffix = useContext(ExtensionTableContext)
  const [searchParams] = useSearchParams()

  const records = createAsync(() => getRecords(props.column.fk.table))

  const onChange = (value: string) => {
    if (value && props.column.fk.extensionTables) {
      setExtTableSuffix?.('_' + value)
    }
  }

  return (
    <select
      name={props.colName}
      class="max-w-full"
      onChange={etv(onChange)}
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
