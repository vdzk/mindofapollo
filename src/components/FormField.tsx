import { Component, createEffect, For, Match, Show, Switch } from "solid-js"
import { schema } from "~/schema/schema"
import { BooleanColumn, DataLiteral, DataRecord, ForeignKey, OptionColumn, TextColumn } from "~/schema/type"
import { FkInput } from "./FkInput"
import { ColumnLabel } from "./ColumnLabel"
import { createAsync, useSearchParams } from "@solidjs/router"
import { SetStoreFunction } from "solid-js/store"
import { etv } from "~/util"
import { TextInput } from "./TextInput"
import { listOriginTypes } from "~/api/list/originTypes"

const getCurrent = (colName: string, diff: DataRecord, record?: DataRecord) =>
  diff[colName] ?? record?.[colName]

export type OnChangeFormat = (format: (rawValue: string) => DataLiteral) =>
  (event: { target: { value: string; name: string; }; }) => void

export const FormField: Component<{
  tableName: string
  colName: string
  label?: string
  record?: DataRecord
  diff: DataRecord
  setDiff: SetStoreFunction<DataRecord>
  hidden?: boolean
}> = (props) => {
  const column = () => schema.tables[props.tableName].columns[props.colName]
  const [searchParams] = useSearchParams()
  const value = () => props.diff[props.colName] ?? props.record?.[props.colName]
  const isNew = () => !props.record

  const updateDiffValue = (colName: string, val: DataLiteral) => {
    const diffValue = (props.record?.[colName] === val) ? undefined! : val
    props.setDiff(colName, diffValue)
  }
  const onChangeFormat = (format: (rawValue: string) => DataLiteral) =>
    etv((newValue, colName) => updateDiffValue(colName, format(newValue)))
  const onChange = onChangeFormat(x => x)

  const originTypes = createAsync(async () => {
    if (column().type === 'value_type_id') {
      return listOriginTypes(props.tableName, props.colName)
    }
  })
  const columnType = () => {
    const col = column()
    if (col.type === 'value_type_id') {
      const typeOriginId = getCurrent(col.typeOriginColumn, props.diff, props.record)
      if (originTypes() && typeOriginId) {
        return originTypes()![typeOriginId as number]
      }
    } else {
      return col.type
    }
  }

  createEffect(() => {
    if (searchParams[props.colName] && columnType() === 'boolean') {
      updateDiffValue(props.colName, searchParams[props.colName] === 'true')
    }
  })

  if (columnType() === 'virtual' && isNew()) return null

  return (
    <label 
      class="block pb-2"
      classList={{ "hidden": props.hidden }}
    >
      <ColumnLabel
        tableName={props.tableName}
        colName={props.colName}
        label={props.label}
      />
      <Switch>
        <Match when={columnType() === 'text'}>
          <TextInput
            value={value()}
            onChange={onChange}
            tableName={props.tableName}
            colName={props.colName}
            lines={(column() as TextColumn).lines ?? 2}
          />
        </Match>
        <Match when={columnType() === 'boolean'}>
          <Switch>
            <Match when={(column() as BooleanColumn).optionLabels}>
              <select
                name={props.colName}
                class="max-w-full"
                onChange={onChangeFormat(x => x === 'true')}
              >
                <Show when={value() === undefined}>
                  <option></option>
                </Show>
                <option
                  value='true'
                  selected={
                    value() === true
                    || searchParams[props.colName] === 'true'
                  }
                >
                  {(column() as BooleanColumn).optionLabels?.[1]}
                </option>
                <option
                  value='false'
                  selected={
                    value() === false
                    || searchParams[props.colName] === 'false'
                  }
                >
                  {(column() as BooleanColumn).optionLabels?.[0]}
                </option>
              </select>
            </Match>
            <Match when>
              <input
                name={props.colName}
                type="checkbox"
                checked={!!value()}
                onChange={event => updateDiffValue(props.colName, event.target.checked)}
              />
            </Match>
          </Switch>
        </Match>
        <Match when={columnType() === 'option'}>
          <select
            name={props.colName}
            class="max-w-full"
            {...{ onChange }}
          >
            <Show when={value() === undefined}>
              <option></option>
            </Show>
            <For each={(column() as OptionColumn).options}>
              {option => <option value={option}>{option}</option>}
            </For>
          </select>
        </Match>
        <Match when={columnType() === 'fk'}>
          <FkInput
            tableName={props.tableName}
            colName={props.colName}
            column={column() as ForeignKey}
            value={value() as number | undefined}
            isNew={isNew()}
            {...{ onChangeFormat }}
          />
        </Match>
        <Match when={columnType() === undefined}>
          <></>
        </Match>
        <Match when>
          <TextInput
            value={value()}
            onChange={onChange}
            tableName={props.tableName}
            colName={props.colName}
          />
        </Match>
      </Switch>
    </label>
  )
}
