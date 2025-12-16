import { useAction, useSearchParams } from "@solidjs/router"
import { Component, ComponentProps, createEffect, createMemo, createSignal, For, Match, on, onMount, Show, Switch, useContext } from "solid-js"
import { schema } from "~/schema/schema"
import { FormField } from "./FormField"
import { DataLiteral, DataRecord, NToNSchema } from "~/schema/type"
import { getExtTableName, getExtTableSelectorColName } from "~/utils/schema"
import { createStore, reconcile } from "solid-js/store"
import { SessionContext } from "~/SessionContext"
import { Link } from "~/components/Link"
import { Button } from "~/components/buttons"
import { getWritableColNames } from "~/permissions"
import { LinkData } from "~/types"
import { isComplete } from "./isComplete"
import { UserExplField } from "./UserExplField"
import { saveAction } from "~/components/form/saveAction"
import { getToggleLabel } from "~/utils/string"
import { CrossRef } from "./CrossRef"

// TODO: try to get rid of `createEffect`s from this file. Nothing exits the system!

export type FormExitHandler = (savedId?: number, userExpl?: string) => void
export type ExitSettings = { getLinkData: (savedId?: number) => LinkData }
  | { onExit: FormExitHandler, passUserExpl?: boolean }

export const Form: Component<{
  tableName: string
  exitSettings: ExitSettings
  id?: number
  record?: DataRecord
  hideColumns?: string[]
  disableColumns?: string[]
  preset?: DataRecord
  preserveDiffOnPresetChange?: boolean
  depth?: number
}> = (props) => {
  const session = useContext(SessionContext)
  const [searchParams] = useSearchParams()
  const [diff, setDiff] = createStore<DataRecord>({})
  const [diffExt, setDiffExt] = createStore<DataRecord>({})
  const [diffExtAlt, setDiffExtAlt] = createStore<DataRecord>({})
  const [extensionTableIndex, setExtensionTableIndex] = createSignal<number>()
  const [showAdvanced, setShowAdvanced] = createSignal(false)
  const [userExpl, setUserExpl] = createSignal('')
  const [optionalExtEnabled, setOptionalExtEnabled] = createSignal(false)
  const [saving, setSaving] = createSignal(false)
  const [saveError, setSaveError] = createSignal('')

  const hasExitHandler = (exit: ExitSettings): exit is { onExit: FormExitHandler } => {
    return 'onExit' in exit
  }

  createEffect(() => {
    if (props.preset) {
      if (props.preserveDiffOnPresetChange) {
        setDiff(props.preset)
      } else {
        setDiff(reconcile(props.preset))
      }
    }
  })

  createEffect(() => !props.id && !diff.id && !('depth' in props) && table().extendsTable && searchParams.id && setDiff('id', searchParams.id as string))

  // Set default values
  createEffect(() => {
    const defaultDiff: Record<string, DataLiteral> = {}
    if (!props.id) {
      const columns = schema.tables[props.tableName].columns
      for (const colName in columns) {
        const column = columns[colName]
        if (
          column.defaultValue !== undefined
          && (!props.preset || !(colName in props.preset))
        ) {
          defaultDiff[colName] = column.defaultValue
        }
      }
      setDiff(defaultDiff)
    }
  })

  const table = () => schema.tables[props.tableName]
  const colNames = () => getWritableColNames(
    props.tableName,
    props.id ? { record: props.record ?? {} } : { newRecord: true },
    session?.userSession?.()?.authRole
  )

  const hasAdvancedFields = () => {
    const tableSchema = table()
    return tableSchema.advanced ? tableSchema.advanced.length > 0 : false
  }
  const currentRecord = () => ({ ...props.record, ...diff })
  const extTableSelectorColName = createMemo(() => getExtTableSelectorColName(props.tableName))
  const extTableName = createMemo(() => getExtTableName(
    props.tableName,
    currentRecord(),
    optionalExtEnabled(),
    extensionTableIndex()
  ))
  const extColumns = () => extTableName() ? schema.tables[extTableName() as string].columns : {}
  const extColNames = () => Object.keys(extColumns())

  // Clear or preserve extDiff when extColNames change
  createEffect(on(
    extColNames,
    newColNames => {
      if (props.preserveDiffOnPresetChange) {
        const newDiffExtAlt = { ...diffExtAlt, ...diffExt }
        setDiffExtAlt(newDiffExtAlt)
        const newDiffExt = Object.fromEntries(
          Object.entries(newDiffExtAlt)
            .filter(([key]) => newColNames.includes(key))
        )
        setDiffExt(reconcile(newDiffExt))
      } else {
        setDiffExt(reconcile({}))
      }
    },
    { defer: true }
  ))

  // Set optional ext default values
  createEffect(() => {
    if (!props.id && optionalExtEnabled()) {
      const _extColumns = extColumns()
      for (const colName in _extColumns) {
        const column = _extColumns[colName]
        if (
          column.defaultValue !== undefined
          && (!props.preset || !(colName in props.preset))
        ) {
          setDiffExt(colName, column.defaultValue)
        }
      }
    }
  })

  const pristine = () => Object.values({ ...diff, ...diffExt })
    .every(value => value === undefined)
  const complete = () => isComplete(
    props.tableName, diff, diffExt, colNames(),
    extTableName(), extColNames(), props.record
  )

  const save = useAction(saveAction)
  const onSubmit = async () => {
    setSaveError('')
    setSaving(true)
    const result = await save(
      props.tableName, props.id, diff,
      extTableName(), diffExt, linkedCrossRefs,
      userExpl(), props.exitSettings, session!
    )
    setSaving(false)
    if (result && ('error' in result)) {
      setSaveError(result.error)
    }
  }

  // If there is nothing else to save don't make the user press save again
  // TODO: check that this actually works
  const onCreatedNew = (colName: string) => {
    if (
      complete()
      && visibleCols().length === 1
      && visibleCols()[0] === colName
      && extFields().length === 0
      && crossRefs().length === 0
    ) {
      onSubmit()
    }
  }

  const handleCancel = () => {
    if (hasExitHandler(props.exitSettings)) {
      props.exitSettings.onExit()
    }
  }

  const fieldGroups = createMemo(() => {
    const _table = table()
    const { tableName, record, hideColumns, depth } = props
    const groupKeys = ['normal', 'advanced'] as const
    const groups = Object.fromEntries(groupKeys.map(
      key => [key, [] as ComponentProps<typeof FormField>[]]
    ))
    const showIdField = _table.extendsTable && !props.id && !props.preset?.id
    for (const colName of [
      ...(showIdField ? ['id'] : []),
      ...colNames()
    ]) {
      const isAdvanced = _table.advanced?.includes(colName)
      const hidden = hideColumns?.includes(colName)
      groups[isAdvanced ? 'advanced' : 'normal'].push({
        tableName, colName, record, diff, setDiff,
        hidden, formDepth: depth,
        disabled: props.disableColumns && props.disableColumns.includes(colName),
        onCreatedNew: () => onCreatedNew(colName),
        setExtensionTableIndex
      })
    }
    return groups
  })

  const extFields = createMemo(() => extColNames()
    .filter(colName => schema.tables[extTableName()!].columns[colName]?.getVisibility?.({...currentRecord(), ...diffExt}) ?? true)
    .map(
      colName => ({
        tableName: extTableName() as string,
        colName, record: props.record,
        diff: diffExt, setDiff: setDiffExt,
        formDepth: props.depth
      })
    )
  )

  const isVisible = (colName: string) => table().columns[colName]
    ?.getVisibility?.(currentRecord()) ?? true

  const visibleCols = createMemo(() => {
    const fields = Object.values(fieldGroups()).flat()
    return fields.filter(field => isVisible(field.colName) && !field.hidden).map(field => field.colName)
  })

  const crossRefs = () => Object.entries((table().aggregates ?? {}))
    .filter(([_, aggregate]) => aggregate.type === 'n-n' && aggregate.first)

  const [linkedCrossRefs, setLinkedCrossRefs] = createStore
    <Record<string, number[]>>(
      Object.fromEntries(crossRefs().map(
        ([aggregateName]) => [aggregateName, [] as number[]]
      ))
    )

  return (
    <div class="px-2 max-w-(--breakpoint-sm) min-w-0 pb-2">
      <For each={fieldGroups().normal}>{field =>
        <>
          <FormField {...field} hidden={!visibleCols().includes(field.colName)} />
          <Show when={extTableSelectorColName() === field.colName}>
            <For each={extFields()}>{FormField}</For>
          </Show>
        </>
      }</For>
      <Show when={!extTableSelectorColName()}>
        <For each={extFields()}>{FormField}</For>
      </Show>
      <Show when={!props.id && !props.depth}>
        <For each={crossRefs()}>
          {([aggregateName, aggregate]) => (
            <CrossRef
              tableName={props.tableName}
              aggregateName={aggregateName}
              aggregate={aggregate as NToNSchema}
              linkedRecordIds={linkedCrossRefs[aggregateName]}
              setLinkedRecordIds={
                (setIds: (curIds: number[]) => number[]) =>
                  setLinkedCrossRefs(aggregateName, setIds)
              }
            />
          )}
        </For>
      </Show>
      <Show when={table().optionallyExtendedByTable}>
        <Button
          label={getToggleLabel(optionalExtEnabled(), table().optionallyExtendedByTable!)}
          onClick={() => setOptionalExtEnabled(x => !x)}
        />
      </Show>
      <Show when={hasAdvancedFields()}>
        <div class="py-2">
          <Button
            label={getToggleLabel(showAdvanced(), 'advanced')}
            onClick={() => setShowAdvanced(!showAdvanced())}
          />
        </div>
      </Show>
      <For each={fieldGroups()?.advanced}>{field =>
        <FormField {...field} hidden={!visibleCols().includes(field.colName) || !showAdvanced()} />
      }</For>
      <Show when={props.id || ('passUserExpl' in props.exitSettings)}>
        <UserExplField value={userExpl()} onChange={setUserExpl} />
      </Show>
      <Show when={saveError()}>
        <div class="pt-2 text-yellow-600">
          {saveError()}
        </div>
      </Show>
      <div class="pt-2">
        <Show when={session?.userSession?.()?.authenticated}>
          <Button
            label={saving() ? "Saving…" : "Save"}
            onClick={onSubmit}
            disabled={pristine() || !complete() || saving()}
          />
        </Show>
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
