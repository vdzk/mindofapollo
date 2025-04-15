import { createAsync, revalidate, useSearchParams } from "@solidjs/router"
import { Component, createEffect, createSignal, For, onMount, Show, Switch, Match, createMemo } from "solid-js"
import { ForeignKey } from "~/schema/type"
import { OnChangeFormat } from "./FormField"
import { listRecordsCache } from "~/client-only/query"
import { getOneIdByName } from "~/api/getOne/idByName"
import { nbsp } from "~/utils/string"
import { Link } from "../Link"
import { whoCanInsertRecord } from "~/api/insert/record"
import { useBelongsTo } from "~/client-only/useBelongsTo"
import { LongSelect } from "./LongSelect"
import { Option } from "~/types"
import { CreateNew } from "./CreateNew"
import { FkDetails } from "../FkDetails"

export const FkInput: Component<{
  tableName: string
  colName: string
  column: ForeignKey
  value?: number
  isNew: boolean
  onChangeFormat: OnChangeFormat
  formDepth?: number
}> = (props) => {
  const [searchParams] = useSearchParams()
  const records = createAsync(() => listRecordsCache(props.column.fk.table))
  const [isPreset, setIsPreset] = createSignal(false)

  const canCreateNew = () => useBelongsTo(whoCanInsertRecord(props.column.fk.table))

  const format = (value: string) => value ? parseInt(value) : null
  const onSelectChange = props.onChangeFormat(format)

  const setValue = (value: string) => {
    onSelectChange({
      target: {
        value,
        name: props.colName
      }
    })
  }

  onMount(() => {
    const spValue = searchParams[props.colName]
    if (spValue && props.formDepth === undefined) {
      setValue(spValue as string)
      setIsPreset(true)
    }
  })

  const defaultValue = createAsync(async () => {
    const { fk } = props.column
    if (fk.defaultName) {
      return await getOneIdByName(fk.table, fk.defaultName)
    }
    return undefined
  })
  createEffect(() => {
    if (props.isNew && defaultValue()) {
      setValue('' + defaultValue())
    }
  })

  const disabled = () => (!props.isNew && !!props.column.fk.extensionTables) || isPreset()

  const onFormExit = async (savedId?: number) => {
    if (savedId) {
      await revalidate(listRecordsCache.keyFor(props.column.fk.table))
      setValue('' + savedId)
    }
  }

  const presetValue = createMemo(() => records()
    ?.find(record => record.id === props.value)
    ?.[props.column.fk.labelColumn])

  const isLargeRecordSet = createMemo(() => (records() ?? []).length > 15)

  // Transform records to dropdown options format
  const dropdownOptions = createMemo<Option<number>[]>(() => {
    if (!records()) return []
    return records()!.map(record => ({
      id: record.id,
      label: record[props.column.fk.labelColumn] as string
    })).sort((a, b) => a.label.localeCompare(b.label));
  })

  return (
    <>
      <Show when={!isPreset() && canCreateNew() && !disabled()}>
        <CreateNew
          tableName={props.column.fk.table}
          onFormExit={onFormExit}
          formDepth={props.formDepth}
        />
      </Show>
      <Switch>
        <Match when={disabled()}>
          <Show when={presetValue()} fallback={<div>{nbsp}</div>}>
            <Link
              label={presetValue()}
              route="show-record"
              params={{
                tableName: props.column.fk.table,
                id: props.value
              }}
              class="mr-2"
            />
          </Show>
        </Match>
        <Match when={!disabled()}>
          <Show when={isLargeRecordSet()}>
            <LongSelect
              options={dropdownOptions()}
              value={props.value}
              name={props.colName}
              onChange={(id) => setValue('' + id)}
              placeholder={canCreateNew() ? "...or select existing" : ""}
              class="mb-1"
            />
          </Show>
          <Show when={!isLargeRecordSet()}>
            <select
              name={props.colName}
              class="max-w-full mr-2"
              onChange={onSelectChange}
            >
              <option>
                <Show when={canCreateNew()}>
                  ...or select existing
                </Show>
              </option>
              <For each={dropdownOptions()}>
                {option => (
                  <option
                    value={option.id}
                    selected={option.id === props.value}
                  >
                    {option.label}
                  </option>
                )}
              </For>
            </select>
          </Show>
        </Match>
      </Switch>
      <Show when={props.value}>
        <FkDetails
          fk={props.column.fk}
          fkId={props.value!}
          depth={props.formDepth}
        />
      </Show>
    </>
  )
}
