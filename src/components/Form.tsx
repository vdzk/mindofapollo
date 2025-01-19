import { action, redirect, useAction, useSearchParams } from "@solidjs/router";
import { Component, createContext, createEffect, createSignal, For, Setter, useContext } from "solid-js";
import { insertRecord, updateRecord } from "~/api/shared/mutate";
import { schema } from "~/schema/schema";
import { FormField } from "./FormField";
import { DataRecord } from "~/schema/type";
import { insertExtRecord, updateExtRecord } from "~/api/shared/extRecord";
import { getExtTableName } from "~/util";
import { createStore } from "solid-js/store";
import { getPermission } from "~/getPermission";
import {getRecords} from "~/client-only/query";
import { SessionContext } from "~/SessionContext";

export const ExtValueContext = createContext<Setter<string | undefined>>()

export const Form: Component<{
  tableName: string
  id?: number
  record?: DataRecord
}> = (props) => {
  const session = useContext(SessionContext)
  const [searchParams] = useSearchParams()
  const [diff, setDiff] = createStore<DataRecord>({})
  const [diffExt, setDiffExt] = createStore<DataRecord>({})
  const [extValue, setExtValue] = createSignal<string>()

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
    record: DataRecord,
    extension?: {
      tableName: string,
      record: DataRecord
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

  const table = () => schema.tables[props.tableName]
  const permission = () => getPermission(session?.user?.()?.id ,'update', props.tableName)
  const colNames = () => {
    if (permission() && permission()?.granted) {
      return permission()?.colNames ?? Object.keys(table().columns)
    } else {
      return []
    }
  }
  const extTableName = () => getExtTableName(props.tableName, props.record, extValue())
  const extColumns = () => extTableName() ? schema.tables[extTableName() as string].columns : {}
  const extColNames = () => Object.keys(extColumns())

  createEffect(() => !props.id && table().extendsTable && searchParams.id && setDiff('id', searchParams.id as string))

  const onSubmit = async () => {
    const extension = extTableName() ? {
      tableName: extTableName() as string,
      record: diffExt
    } : undefined
    saveAction(props.tableName, diff, extension)
  }

  return (
    <form onSubmit={onSubmit} class="px-2 max-w-screen-sm">
      <ExtValueContext.Provider value={setExtValue}>
        <For each={colNames()}>
          {colName => <FormField
            tableName={props.tableName}
            colName={colName}
            record={props.record}
            diff={diff}
            setDiff={setDiff}
          />}
        </For>
      </ExtValueContext.Provider>
      <For each={extColNames()}>
        {colName => <FormField
          tableName={extTableName() as string}
          colName={colName}
          record={props.record}
          diff={diffExt}
          setDiff={setDiffExt}
        />}
      </For>
      <div class="pt-2">
        <button type="button" class="text-sky-800" onClick={onSubmit}>
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
