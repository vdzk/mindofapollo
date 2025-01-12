import { Component, createEffect, For, Match, Show, Switch } from "solid-js";
import { schema } from "~/schema/schema";
import { BooleanColumn, DataLiteral, DataRecord, ForeignKey, OptionColumn, TextColumn } from "~/schema/type";
import { FkInput } from "./FkInput";
import { ColumnLabel } from "./ColumnLabel";
import { createAsync, useSearchParams } from "@solidjs/router";
import { getOriginTypes } from "~/api/shared/valueType";
import { SetStoreFunction, unwrap } from "solid-js/store";
import { etv } from "~/util";

const inputTypes = {
  varchar: 'text',
  text: 'hidden',
  boolean: 'checkbox',
  integer: 'text',
  proportion: 'text',
  weight: 'text',
  link_url: 'text',
  link_title: 'text',
  fk: 'hidden',
  virtual: 'text',
  option: 'text',
  value_type_id: 'text'
}

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
}> = (props) => {
  const column = () => schema.tables[props.tableName].columns[props.colName]
  const [searchParams] = useSearchParams()
  const value = () => props.diff[props.colName] ?? props.record?.[props.colName]

  const updateDiffValue = (colName: string, val: DataLiteral) => {
    const diffValue = (props.record?.[colName] === val) ? undefined! : val
    props.setDiff(colName, diffValue)
  }
  const onChangeFormat = (format: (rawValue: string) => DataLiteral) =>
    etv((newValue, colName) => updateDiffValue(colName, format(newValue)))
  const onChange = onChangeFormat(x => x)

  const originTypes = createAsync(async () => {
    if (column().type === 'value_type_id') {
      return getOriginTypes(props.tableName, props.colName)
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

  if (
    (columnType() === 'boolean' && (column() as BooleanColumn).readOnly)
    || (columnType() === 'virtual' && !props.record)
  ) return null

  return (
    <label class="block pb-2">
      <ColumnLabel
        colName={props.colName}
        column={column()}
        label={props.label}
      />
      <Switch>
        <Match when={columnType() === 'text'}>
          <textarea
            name={props.colName}
            class="border w-full px-0.5"
            rows={(column() as TextColumn).lines}
            {...{ onChange }}
          >
            {value()}
          </textarea>
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
            value={value()}
            {...{ onChangeFormat }}
          />
        </Match>
        <Match when={columnType() === undefined}>
          <></>
        </Match>
        <Match when>
          <input
            name={props.colName}
            value={(value() ?? '') + ''}
            type={inputTypes[columnType()!]}
            class="border rounded pl-1 w-full"
            autocomplete="off"
            readonly={columnType() === 'virtual'}
            {...{ onChange }}
          />
        </Match>
      </Switch>
    </label>
  )
}
