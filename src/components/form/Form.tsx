import { useAction, useSearchParams } from "@solidjs/router"
import { Component, ComponentProps, createEffect, createMemo, createSignal, For, Match, Show, Switch, useContext } from "solid-js"
import { schema } from "~/schema/schema"
import { FormField } from "./FormField"
import { DataLiteral, DataRecord, NToNSchema } from "~/schema/type"
import { getExtTableName } from "~/utils/schema"
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

export type FormExitHandler = (savedId?: number) => void
export type ExitSettings = { getLinkData: (savedId?: number) => LinkData }
  | { onExit: FormExitHandler }

export const Form: Component<{
  tableName: string
  exitSettings: ExitSettings
  id?: number
  record?: DataRecord
  hideColumns?: string[]
  disableColumns?: string[]
  preset?: DataRecord
  depth?: number
}> = (props) => {
  const session = useContext(SessionContext)
  const [searchParams] = useSearchParams()
  const [diff, setDiff] = createStore<DataRecord>({})
  const [diffExt, setDiffExt] = createStore<DataRecord>({})
  const [showAdvanced, setShowAdvanced] = createSignal(false)
  const [userExpl, setUserExpl] = createSignal('')


  const hasExitHandler = (exit: ExitSettings): exit is { onExit: FormExitHandler } => {
    return 'onExit' in exit
  }

  createEffect(() => {
    if (props.preset) {
      setDiff(reconcile(props.preset))
    }
  })
  // Clear extDiff when extTableName changes
  createEffect(() => {
    extTableName()
    setDiffExt(reconcile({}))
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
  const colNames = () => getWritableColNames(props.tableName, session?.userSession?.()?.authRole)

  const hasAdvancedFields = () => {
    const tableSchema = table()
    return tableSchema.advanced ? tableSchema.advanced.length > 0 : false
  }
  const currentRecord = () => ({ ...props.record, ...diff })
  const extTableName = createMemo(() => getExtTableName(props.tableName, currentRecord()))
  const extColumns = () => extTableName() ? schema.tables[extTableName() as string].columns : {}
  const extColNames = () => Object.keys(extColumns())

  const pristine = () => Object.values({ ...diff, ...diffExt })
    .every(value => value === undefined)
  const complete = () => isComplete(
    props.tableName, diff, diffExt, colNames(),
    extTableName(), extColNames(), props.record
  )

  const save = useAction(saveAction)
  const onSubmit = () => save(
    props.tableName, props.id, diff,
    extTableName(), diffExt, linkedCrossRefs,
    userExpl(), props.exitSettings, session!
  )

  // If there is nothing else to save don't make the user press save again
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
      })
    }
    return groups
  })

  const extFields = createMemo(() => extColNames().map(
    colName => ({
      tableName: extTableName() as string,
      colName, record: props.record,
      diff: diffExt, setDiff: setDiffExt,
      formDepth: props.depth
    })
  ))

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
    <div class="px-2 max-w-(--breakpoint-sm) pb-2">
      <For each={fieldGroups().normal}>{field =>
        <FormField {...field} hidden={!visibleCols().includes(field.colName)} />
      }</For>
      <For each={extFields()}>{FormField}</For>
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
      <Show when={hasAdvancedFields()}>
        <div class="py-2">
          <Button
            label={getToggleLabel(showAdvanced(), 'advanced')}
            onClick={() => setShowAdvanced(!showAdvanced())}
          />
        </div>
      </Show>
      <For each={fieldGroups().advanced}>{field =>
        <FormField {...field} hidden={!visibleCols().includes(field.colName) || !showAdvanced()} />
      }</For>
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
