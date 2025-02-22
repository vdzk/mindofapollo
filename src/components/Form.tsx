import { action, redirect, useAction, useSearchParams } from "@solidjs/router"
import { Component, createContext, createEffect, createSignal, For, Setter, Show, useContext } from "solid-js"
import { schema } from "~/schema/schema"
import { FormField } from "./FormField"
import { DataRecord } from "~/schema/type"
import { getExtTableName, isEmpty, buildUrl } from "~/util"
import { createStore } from "solid-js/store"
import { getRecords } from "~/client-only/query"
import { SessionContext } from "~/SessionContext"
import { Link } from "~/components/Link"
import { Button } from "~/components/buttons"
import { updateExtRecord } from "~/api/update/extRecord"
import { updateRecord } from "~/api/update/record"
import { insertExtRecord } from "~/api/insert/extRecord"
import { insertRecord } from "~/api/insert/record"
import { getWritableColNames } from "~/permissions"

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
  const [showAdvanced, setShowAdvanced] = createSignal(false)

  const exitLink = (tableName: string) => {
    if (props.id) {
      return {
        route: 'show-record',
        params: { tableName, id: props.id }
      }
    } else {
      if (searchParams.sourceTable && searchParams.sourceId) {
        return {
          route: 'show-record',
          params: { tableName: searchParams.sourceTable, id: searchParams.sourceId }
        }
      } else {
        return {
          route: 'list-records',
          params: { tableName }
        }
      }
    }
  }

  const exitPath = (tableName: string) => {
    const { route, params } = exitLink(tableName)
    return buildUrl(route, params)
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
  const colNames = () => getWritableColNames(props.tableName, session?.userSession?.()?.authRole)

  const isAdvanced = (colName: string) => table().advanced?.includes(colName)

  const hasAdvancedFields = () => {
    const tableSchema = table()
    return tableSchema.advanced ? tableSchema.advanced.length > 0 : false
  }
  const extTableName = () => getExtTableName(props.tableName, props.record, extValue())
  const extColumns = () => extTableName() ? schema.tables[extTableName() as string].columns : {}
  const extColNames = () => Object.keys(extColumns())

  createEffect(() => !props.id && table().extendsTable && searchParams.id && setDiff('id', searchParams.id as string))
  const pristine = () => Object.entries(diff).every(
    ([key, value]) => (key === 'id') || value === undefined)

  const onSubmit = async () => {
    const extension = extTableName() && !isEmpty(diffExt) ? {
      tableName: extTableName() as string,
      record: diffExt
    } : undefined
    saveAction(props.tableName, diff, extension)
  }

  return (
    <div class="px-2 max-w-screen-sm">
      <ExtValueContext.Provider value={setExtValue}>
        <For each={colNames()}>
          {colName => (
            <FormField
              tableName={props.tableName}
              colName={colName}
              record={props.record}
              diff={diff}
              setDiff={setDiff}
              hidden={isAdvanced(colName) && !showAdvanced()}
            />
          )}
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
      <Show when={hasAdvancedFields()}>
        <div class="py-2">
          <Button
            label={showAdvanced() ? 'Hide advanced fields' : 'Show advanced fields'}
            onClick={() => setShowAdvanced(!showAdvanced())}
          />
        </div>
      </Show>
      <div class="pt-2">
        <Button
          label="Save"
          onClick={onSubmit}
          disabled={pristine()}
        />
        <span class="inline-block w-2" />
        <Link
          {...exitLink(props.tableName)}
          type="button"
          label="Cancel"
        />
      </div>
    </div>
  )
}
