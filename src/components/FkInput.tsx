import { createAsync, useSearchParams } from "@solidjs/router";
import { Component, createEffect, For, useContext } from "solid-js";
import { ForeignKey } from "~/schema/type";
import { ExtValueContext } from "./Form";
import { OnChangeFormat } from "./FormField";
import { schema } from "~/schema/schema";
import {getRecords} from "~/client-only/query";


export const FkInput: Component<{
  tableName: string,
  colName: string,
  column: ForeignKey,
  value?: any
  onChangeFormat: OnChangeFormat
}> = (props) => {
  const [searchParams] = useSearchParams()
  const records = createAsync(() => getRecords(props.column.fk.table))
  const setExtValue = useContext(ExtValueContext)!
  const format = (value: string) => {
    const { fk } = props.column
    if (fk.extensionTables) {
      setExtValue(value || undefined)
    }
    if (value) {
      if (!schema.tables[fk.table].columns.id) {
        return parseInt(value)
      } else {
        return value
      }
    } else {
      return null
    }
  }
  const onChange = props.onChangeFormat(format)

  createEffect(() => {
    const spValue = searchParams[props.colName]
    if (spValue) {
      onChange({target: {
        value: spValue as string,
        name: props.colName
      }})
    }
  })

  return (
    <select
      name={props.colName}
      class="max-w-full"
      disabled={props.value && props.column.fk.extensionTables}
      onChange={onChange}
    >
      <option></option>
      <For each={records()}>
        {record => (
          <option
            value={record.id}
            selected={record.id === props.value}
          >
            {record[props.column.fk.labelColumn]}
          </option>
        )}
      </For>
    </select>
  );
};
