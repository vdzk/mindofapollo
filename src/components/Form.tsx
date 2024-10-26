import { action, redirect, useAction, useParams, useSearchParams } from "@solidjs/router";
import { Component, For} from "solid-js";
import { insertRecord, updateRecord } from "~/server/db";
import { schema } from "~/schema";
import { getRecords } from "~/server/api";
import postgres from "postgres";
import { FormField } from "./FormField";

export const Form: Component<{
  tableName: string,
  id?: string,
  record?: postgres.Row;
}> = (props) => {
  const [searchParams] = useSearchParams()

  const exitPath = (tableName: string) => {
    if (props.id) {
      return `/show-record?tableName=${tableName}&id=${props.id}`
    } else {
      if (searchParams.sourceTable && searchParams.sourceId) {
        return `/show-record?tableName=${searchParams.sourceTable}&id=${searchParams.sourceId}`
      } else {
        return `/list-records?tableName=${ tableName}`
      }
    }
  }

  const save = action(async (
    tableName: string,
    record: Record<string, string | boolean>
  ) => {
    if (props.id) {
      await updateRecord(tableName, props.id, record)
      throw redirect(
        exitPath(tableName),
        { revalidate: [
          getRecords.keyFor(tableName), // TODO: this doesn't seem to be doing anything
          'getRecords' + tableName + props.id
        ] }
      )
    } else {
      await insertRecord(tableName, record)
      throw redirect(exitPath(tableName))
    }
  })

  const saveAction = useAction(save);

  const columns = () => schema.tables[props.tableName].columns
  const colNames = () => Object.keys(columns())


  const onSubmit = async (event: SubmitEvent & { target: Element, currentTarget: HTMLFormElement; }) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const record: Record<string, string | boolean> = {}
    for (const [colName, column] of Object.entries(columns())) {
      if (column.type === 'boolean') {
        if (column.optionLabels) {
          record[colName] = formData.get(colName) === 'true'
        } else {
          record[colName] = formData.has(colName)
        }
      } else {
        record[colName] = formData.get(colName) + ''
      }
    }
    saveAction(props.tableName, record)
  }

  return (
    <form onSubmit={onSubmit} class="px-2 max-w-screen-sm">
      <For each={colNames()}>
        {colName => <FormField
          tableName={props.tableName}
          colName={colName}
          value={props.record?.[colName]}
        />}
      </For>
      <div class="pt-2">
        <button type="submit" class="text-sky-800">
          [ {props.id ? 'Save' : '+ Add'} ]
        </button>
        <a
          class="text-sky-800 mx-2"
          href={exitPath(props.tableName)}
        >
          [ Cancel ]
        </a>
      </div>
    </form>
  )
}