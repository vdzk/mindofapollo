import { action, redirect, useAction, useSearchParams, revalidate } from "@solidjs/router"
import { Component, createContext, createEffect, createSignal, For, Match, Setter, Show, Switch, useContext } from "solid-js"
import { schema } from "~/schema/schema"
import { FormField } from "./FormField"
import { DataRecord, DataRecordWithId } from "~/schema/type"
import { isEmpty } from "~/utils/shape"
import { buildUrl } from "~/utils/string"
import { getExtTableName } from "~/utils/schema"
import { createStore, reconcile } from "solid-js/store"
import { getRecords } from "~/client-only/query"
import { SessionContext } from "~/SessionContext"
import { Link } from "~/components/Link"
import { Button } from "~/components/buttons"
import { updateExtRecord } from "~/api/update/extRecord"
import { updateRecord } from "~/api/update/record"
import { insertExtRecord } from "~/api/insert/extRecord"
import { insertRecord } from "~/api/insert/record"
import { getWritableColNames } from "~/permissions"
import { LinkData } from "~/types"
import { isComplete } from "./isComplete"
import { login } from "~/api/execute/login"

export const ExtValueContext = createContext<(value: string) => void>()

export type FormExitHandler = (savedId?: number) => void
export type ExitSettings = { linkData: LinkData } | { onExit: FormExitHandler }

export const Form: Component<{
  tableName: string
  exitSettings: ExitSettings
  id?: number
  record?: DataRecord
}> = (props) => {
  const session = useContext(SessionContext)
  const [searchParams] = useSearchParams()
  const [diff, setDiff] = createStore<DataRecord>({})
  const [diffExt, setDiffExt] = createStore<DataRecord>({})
  const [extValue, setExtValue] = createSignal<string>()
  const [showAdvanced, setShowAdvanced] = createSignal(false)

  const isSelf = () => props.tableName === 'person' && props.id === session?.userSession?.()?.userId
  const hasExitHandler = (exit: ExitSettings): exit is { onExit: FormExitHandler } => {
    return 'onExit' in exit
  }

  const getExitUrl = () => hasExitHandler(props.exitSettings)
    ? ''
    : buildUrl(
      props.exitSettings.linkData.route,
      props.exitSettings.linkData.params
    )

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
      if (isSelf()) {
        await login(props.id)
        await session?.refetch()
      }
      if (hasExitHandler(props.exitSettings)) {
        revalidate([
          getRecords.keyFor(tableName),
          'getRecords' + tableName + props.id
        ])
        props.exitSettings.onExit(props.id)
        return
      } else {
        throw redirect(
          getExitUrl(),
          {
            revalidate: [
              getRecords.keyFor(tableName),
              'getRecords' + tableName + props.id
            ]
          }
        )
      }
    } else {
      let savedRecord: DataRecordWithId | undefined
      if (extension) {
        savedRecord = await insertExtRecord(
          tableName, record, extension.tableName, extension.record
        )
      } else {
        savedRecord = await insertRecord(tableName, record)
      }
      if (hasExitHandler(props.exitSettings)) {
        revalidate([getRecords.keyFor(tableName)])
        props.exitSettings.onExit(savedRecord?.id)
        return
      } else {
        throw redirect(getExitUrl())
      }
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
    ([key, value]) => (key === 'id') || value === undefined) && 
    Object.values(diffExt).every(value => value === undefined)
  const complete = () => isComplete(
    props.tableName, 
    diff, 
    diffExt, 
    colNames(),
    extTableName(),
    extColNames(),
    props.record
  )

  const onSubmit = async () => {
    const extension = extTableName() && !isEmpty(diffExt) ? {
      tableName: extTableName() as string,
      record: diffExt
    } : undefined
    saveAction(props.tableName, diff, extension)
  }

  const handleCancel = () => {
    if (hasExitHandler(props.exitSettings)) {
      props.exitSettings.onExit()
    }
  }

  const updateExtValue = (value: string) => {
    setExtValue(value)
    setDiffExt(reconcile({}))
  }

  return (
    <div class="px-2 max-w-screen-sm pb-2">
      <ExtValueContext.Provider value={updateExtValue}>
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
          disabled={pristine() || !complete()}
        />
        <span class="inline-block w-2" />
        <Switch>
          <Match when={hasExitHandler(props.exitSettings)}>
            <Button
              label="Cancel"
              onClick={handleCancel}
            />
          </Match>
          <Match when={!hasExitHandler(props.exitSettings)}>
            <Link
              {...(props.exitSettings as { linkData: LinkData }).linkData}
              type="button"
              label="Cancel"
            />
          </Match>
        </Switch>
      </div>
    </div>
  )
}
