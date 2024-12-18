import { createAsync, useSearchParams } from "@solidjs/router";
import { Component, createEffect, For, Show, useContext } from "solid-js";
import { ForeignKey } from "~/schema/type";
import { getRecords } from "~/server/api";
import { ExtValueContext } from "./Form";


export const FkInput: Component<{
  colName: string,
  column: ForeignKey,
  value?: any
}> = (props) => {
  const [searchParams] = useSearchParams()
  const records = createAsync(() => getRecords(props.column.fk.table))
  const setExtValue = useContext(ExtValueContext)!

  return (
    <select
      name={props.colName}
      class="max-w-full"
      disabled={props.value && props.column.fk.extensionTables}
      onChange={props.column.fk.extensionTables
        ? ((event) => setExtValue(event.target.value || undefined))
        : undefined
      }
    >
      <option></option>
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
