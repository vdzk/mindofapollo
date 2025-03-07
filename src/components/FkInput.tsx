import { createAsync, revalidate, useSearchParams } from "@solidjs/router"
import { Component, createEffect, createSignal, For, onMount, Show, useContext } from "solid-js"
import { ForeignKey } from "~/schema/type"
import { ExtValueContext, Form } from "./Form"
import { OnChangeFormat } from "./FormField"
import { getRecords } from "~/client-only/query"
import { getOneIdByName } from "~/api/getOne/idByName"
import { Button } from "./buttons"
import { Subtitle } from "./PageTitle"
import { humanCase } from "~/util"


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
      return await getOneIdByName( fk.table, fk.defaultName )
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
    console.log('onFormExit', savedId)
    setShowForm(false)
    if (savedId) {
      await revalidate(getRecords.keyFor(props.column.fk.table))
      setValue('' + savedId)
    }
  }

  createEffect(() => {
    if (props.colName === 'statement_id') {
      console.log({
        colName: props.colName,
        showForm: showForm()
      })
    }
  })

  return (
    <>
      <Show when={!isPreset()}>
        <Show when={!showForm()}>
          <div class="pb-1">
            <Button
              label="Create new"
              onClick={() => {
                console.log('Clicked create new')
                setShowForm(true)
              }}
            />
          </div>
        </Show>
        <Show when={showForm()}>
          <Subtitle>New {humanCase(props.column.fk.table)}</Subtitle>
          <Form
            tableName={props.column.fk.table}
            exitSettings={{onExit: onFormExit}}
          />
        </Show>
      </Show>
      <select
        name={props.colName}
        class="max-w-full"
        disabled={disabled()}
        onChange={onSelectChange}
      >
        <option>...or select existing</option>
        <For each={records()}>
          {record => (
            <option
              value={record.id}
              selected={record.id === props.value}
            >
              {record[props.column.fk.labelColumn]}
            </option>
          )}
        </For>
      </select>
    </>
  );
};
