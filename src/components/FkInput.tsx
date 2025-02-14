import { createAsync, useSearchParams } from "@solidjs/router";
import { Component, createEffect, For, useContext } from "solid-js";
import { ForeignKey } from "~/schema/type";
import { ExtValueContext } from "./Form";
import { OnChangeFormat } from "./FormField";
import {getRecords} from "~/client-only/query";


export const FkInput: Component<{
  tableName: string
  colName: string
  column: ForeignKey
  value?: number
  isNew: boolean
  onChangeFormat: OnChangeFormat
}> = (props) => {
  const [searchParams] = useSearchParams()
  const records = createAsync(() => getRecords(props.column.fk.table))
  const setExtValue = useContext(ExtValueContext)!
  const format = (value: string) => {
    const { fk } = props.column
    if (fk.extensionTables) {
      if (value) {
        setExtValue(fk.extensionTables[parseInt(value)])
      } else {
        setExtValue(undefined)
      }
    }
    if (value) {
      return parseInt(value)
    }
    return null
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
      disabled={!props.isNew && !!props.column.fk.extensionTables}
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
