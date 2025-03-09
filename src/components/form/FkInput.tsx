import { createAsync, revalidate, useSearchParams } from "@solidjs/router"
import { Component, createEffect, createSignal, For, onMount, Show, useContext, Switch, Match, createMemo } from "solid-js"
import { ForeignKey } from "~/schema/type"
import { ExtValueContext, Form } from "./Form"
import { OnChangeFormat } from "./FormField"
import { getRecords } from "~/client-only/query"
import { getOneIdByName } from "~/api/getOne/idByName"
import { Button } from "../buttons"
import { Subtitle } from "../PageTitle"
import { humanCase, nbsp } from "~/utils/string"
import { Link } from "../Link"
import { RecordDetails } from "../RecordDetails"
import { whoCanInsertRecord } from "~/api/insert/record"
import { useBelongsTo } from "~/client-only/useBelongsTo"
import { LongSelect } from "./LongSelect"
import { Option } from "~/types"

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
  const [isPreset, setIsPreset] = createSignal(false)
  const [showForm, setShowForm] = createSignal(false)
  const [showRecord, setShowRecord] = createSignal(false)

  const canCreateNew = () => useBelongsTo(whoCanInsertRecord(props.column.fk.table))

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
    if (spValue) {
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
    setShowForm(false)
    if (savedId) {
      await revalidate(getRecords.keyFor(props.column.fk.table))
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
      <Show when={!isPreset()}>
        <Show when={canCreateNew() && !disabled() && !showForm()}>
          <div class="pb-1">
            <Button
              label="Create new"
              onClick={() => setShowForm(true)}
            />
          </div>
        </Show>
        <Show when={showForm()}>
          <div class="bg-orange-100 rounded-md my-2 p-2">
            <Subtitle>New {humanCase(props.column.fk.table)}</Subtitle>
            <Form
              tableName={props.column.fk.table}
              exitSettings={{ onExit: onFormExit }}
            />
          </div>
        </Show>
      </Show>
      <Switch>
        <Match when={disabled()}>
          <Show when={presetValue()} fallback={<div>{nbsp}</div>}>
            <Switch>
              <Match when={showRecord()}>
                <div class="bg-orange-100 rounded-md my-2 p-2 pb-4">
                  <RecordDetails
                    tableName={props.column.fk.table}
                    id={props.value!}
                    showAggregates={false}
                    showExplLinks={false}
                  />
                  <Button
                    label="collapse"
                    onClick={() => setShowRecord(false)}
                    class="ml-2"
                  />
                </div>
              </Match>
              <Match when={!showRecord()}>
                <Link
                  label={presetValue()}
                  route="show-record"
                  params={{
                    tableName: props.column.fk.table,
                    id: props.value
                  }}
                />{' '}
                <Button
                  label="expand"
                  onClick={() => setShowRecord(true)}
                />
              </Match>
            </Switch>
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
            />
          </Show>
          <Show when={!isLargeRecordSet()}>
            <select
              name={props.colName}
              class="max-w-full"
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
    </>
  );
};
