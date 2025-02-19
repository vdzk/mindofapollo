import { createAsync, useSearchParams } from "@solidjs/router";
import { Component, createEffect, For, useContext } from "solid-js";
import { ForeignKey } from "~/schema/type";
import { ExtValueContext } from "./Form";
import { OnChangeFormat } from "./FormField";
import {getRecords} from "~/client-only/query";
import { getIdByRecord } from "~/server-only/getIdByRecord";


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
  const onSelectChange = props.onChangeFormat(format)

  createEffect(() => {
    const spValue = searchParams[props.colName]
    if (spValue) {
      onSelectChange({target: {
        value: spValue as string,
        name: props.colName
      }})
    }
  })

  const defaultValue = createAsync(async () => {
    const { fk } = props.column
    if (fk.defaultValueLabel) {
      return getIdByRecord(
        fk.table,
        {[fk.labelColumn]: fk.defaultValueLabel}
      )
    }
    return undefined  
  })
  createEffect(() => {
    if (props.isNew && defaultValue()) {
      onSelectChange({target: {
        value: '' + defaultValue(),
        name: props.colName
      }})
    }
  })

  return (
    <select
      name={props.colName}
      class="max-w-full"
      disabled={!props.isNew && !!props.column.fk.extensionTables}
      onChange={onSelectChange}
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
