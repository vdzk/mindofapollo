import { action, redirect, useAction, useSearchParams } from "@solidjs/router";
import { Component, createContext, createSignal, For, Setter } from "solid-js";
import { insertRecord, updateRecord } from "~/server/db";
import { schema } from "~/schema/schema";
import { getRecords } from "~/server/api";
import postgres from "postgres";
import { FormField } from "./FormField";
import { ColumnSchema, DataLiteral } from "~/schema/type";
import { insertExtRecord, updateExtRecord } from "~/server/extRecord.db";
import { getExtTableName } from "~/util";

const parseForm = (
  formData: FormData,
  columns: Record<string, ColumnSchema>
) => {
  const record: Record<string, DataLiteral> = {}
  for (const [colName, column] of Object.entries(columns)) {
    if (column.type === 'boolean') {
      if (column.optionLabels) {
        record[colName] = formData.get(colName) === 'true'
      } else {
        record[colName] = formData.has(colName)
      }
    } else if (column.type === 'fk' && column.name) {
      record[column.name] = formData.get(colName) + ''
    } else {
      record[colName] = formData.get(colName) + ''
    }
  }
  return record
}

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
        return `/list-records?tableName=${tableName}`
      }
    }
  }

  const saveAction = useAction(action(async (
    tableName: string,
    record: Record<string, DataLiteral>,
    extension?: {
      tableName: string,
      record: Record<string, DataLiteral>
    }
  ) => {
    if (props.id) {
      if (extension) {
        await updateExtRecord(
          tableName, props.id, record, extension.tableName, extension.record
        )
      } else {
        await updateRecord(tableName, props.id, record)
      }
      throw redirect(
        exitPath(tableName),
        {
          revalidate: [
            getRecords.keyFor(tableName), // TODO: this doesn't seem to be doing anything
            'getRecords' + tableName + props.id
          ]
        }
      )
    } else {
      if (extension) {
        await insertExtRecord(
          tableName, record, extension.tableName, extension.record
        )
      } else {
        await insertRecord(tableName, record)
      }
      throw redirect(exitPath(tableName))
    }
  }))

  const columns = () => schema.tables[props.tableName].columns
  const colNames = () => Object.keys(columns())
  const extTableName = () => props.record && getExtTableName(props.tableName, props.record)
  const extColumns = () => extTableName() ? schema.tables[extTableName() as string].columns : {}
  const extColNames = () => Object.keys(extColumns())

  const onSubmit = async (event: SubmitEvent & { target: Element, currentTarget: HTMLFormElement; }) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const record = parseForm(formData, columns())
    const extension = extTableName() ? {
      tableName: extTableName() as string,
      record: parseForm(formData, extColumns())
    } : undefined
    saveAction(props.tableName, record, extension)
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
      <For each={extColNames()}>
        {colName => <FormField
          tableName={extTableName() as string}
          colName={colName}
          value={props.record?.[colName]}
        />}
      </For>
      <div class="pt-2">
        <button type="submit" class="text-sky-800">
          [ Save ]
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
