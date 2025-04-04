import { useAction, useSearchParams } from "@solidjs/router"
import { Component, ComponentProps, createContext, createEffect, createMemo, createSignal, For, Match, Show, Switch, useContext } from "solid-js"
import { schema } from "~/schema/schema"
import { FormField } from "./FormField"
import { DataRecord } from "~/schema/type"
import { getExtTableName, titleColumnName } from "~/utils/schema"
import { createStore, reconcile } from "solid-js/store"
import { SessionContext } from "~/SessionContext"
import { Link } from "~/components/Link"
import { Button } from "~/components/buttons"
import { getWritableColNames } from "~/permissions"
import { LinkData } from "~/types"
import { isComplete } from "./isComplete"
import { UserExplField } from "./UserExplField"
import { saveAction } from "~/components/form/saveAction"
import { FkInput } from "./FkInput"

export const ExtValueContext = createContext<(value?: string) => void>()

export type FormExitHandler = (savedId?: number) => void
export type ExitSettings = { getLinkData: (savedId?: number) => LinkData }
  | { onExit: FormExitHandler }

export const Form: Component<{
  tableName: string
  exitSettings: ExitSettings
  id?: number
  record?: DataRecord
  hideColumns?: string[]
  preset?: DataRecord
  depth?: number
}> = (props) => {
  const session = useContext(SessionContext)
  const [searchParams] = useSearchParams()
  const [diff, setDiff] = createStore<DataRecord>({})
  const [diffExt, setDiffExt] = createStore<DataRecord>({})
  const [extValue, setExtValue] = createSignal<string>()
  const [showAdvanced, setShowAdvanced] = createSignal(false)
  const [userExpl, setUserExpl] = createSignal('')


  const hasExitHandler = (exit: ExitSettings): exit is { onExit: FormExitHandler } => {
    return 'onExit' in exit
  }

  createEffect(() => {
    if (props.preset) {
      setDiff(reconcile(props.preset))
      setExtValue(undefined)
    }
  })
  createEffect(() => !props.id && !diff.id && table().extendsTable && searchParams.id && setDiff('id', searchParams.id as string))

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

  const pristine = () => Object.entries(diff).every(
    ([key, value]) => (key === 'id') || value === undefined) &&
    Object.values(diffExt).every(value => value === undefined)
  const complete = () => isComplete(
    props.tableName, diff, diffExt, colNames(),
    extTableName(), extColNames(), props.record
  )

  const save = useAction(saveAction)
  const onSubmit = () => save(
    props.tableName, props.id, diff,
    extTableName(), diffExt,
    userExpl(), props.exitSettings
  )

  const handleCancel = () => {
    if (hasExitHandler(props.exitSettings)) {
      props.exitSettings.onExit()
    }
  }

  const updateExtValue = (value?: string) => {
    setExtValue(value)
    setDiffExt(reconcile({}))
  }

  const fieldGroups = createMemo(() => {
    const _table = table()
    const { tableName, record, hideColumns, depth } = props
    const groupKeys = ['normal', 'advanced', 'ext'] as const
    const groups = Object.fromEntries(groupKeys.map(
      key => [key, [] as ComponentProps<typeof FormField>[]]
    ))
    for (const colName of [
      ...(_table.extendsTable ? ['id'] : []),
      ...colNames()
    ]) {
      const isAdvanced = _table.advanced?.includes(colName)
      const hidden = hideColumns?.includes(colName)
        || (isAdvanced && !showAdvanced())
      groups[isAdvanced ? 'advanced' : 'normal'].push({
        tableName, colName, record, diff, setDiff,
        hidden, formDepth: depth
      })
    }
    for (const colName of extColNames()) {
      groups.ext.push({
        tableName: extTableName() as string,
        colName, record, diff: diffExt, setDiff: setDiffExt,
        formDepth: depth
      })
    }
    return groups
  })

  return (
    <div class="px-2 max-w-(--breakpoint-sm) pb-2">
      <ExtValueContext.Provider value={updateExtValue}>
        <For each={fieldGroups().normal}>{FormField}</For>
        <For each={fieldGroups().ext}>{FormField}</For>
        <Show when={hasAdvancedFields()}>
          <div class="py-2">
            <Button
              label={showAdvanced() ? 'Hide advanced fields' : 'Show advanced fields'}
              onClick={() => setShowAdvanced(!showAdvanced())}
            />
          </div>
        </Show>
        <For each={fieldGroups().advanced}>{FormField}</For>
      </ExtValueContext.Provider>
      <Show when={props.id}>
        <UserExplField value={userExpl()} onChange={setUserExpl} />
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
              {...(props.exitSettings as { getLinkData: () => LinkData }).getLinkData()}
              type="button"
              label="Cancel"
            />
          </Match>
        </Switch>
      </div>
    </div>
  )
}
