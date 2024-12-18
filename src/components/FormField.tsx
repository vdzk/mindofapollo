import { Component, Match, Show, Switch } from "solid-js";
import { schema } from "~/schema/schema";
import { BooleanColumn, ForeignKey, TextColumn } from "~/schema/type";
import { FkInput } from "./FkInput";
import { ColumnLabel } from "./ColumnLabel";
import { useSearchParams } from "@solidjs/router";

const inputTypes = {
  varchar: 'text',
  text: 'hidden',
  boolean: 'checkbox',
  integer: 'text',
  proportion: 'text',
  link_url: 'text',
  link_title: 'text',
  fk: 'hidden'
}

export const FormField: Component<{
  tableName: string,
  colName: string,
  value?: any,
  label?: string
}> = (props) => {
  const column = () => schema.tables[props.tableName].columns[props.colName]
  const [searchParams] = useSearchParams()

  if (column().type === 'boolean' && (column() as BooleanColumn).readOnly) {
    return null
  }

  return (
    <label class="block pb-2">
      <ColumnLabel
        colName={props.colName}
        column={column()}
        label={props.label}
      />
      <Switch>
        <Match when={column().type === 'text'}>
          <textarea
            name={props.colName}
            class="border w-full px-0.5"
            rows={(column() as TextColumn).lines}
          >
            {props.value}
          </textarea>
        </Match>
        <Match when={
          column().type === 'boolean'
          && (column() as BooleanColumn).optionLabels
        }>
          <select name={props.colName} class="max-w-full">
            <Show when={props.value === undefined}>
              <option></option>
            </Show>
            <option
              value='true'
              selected={
                props.value === true
                || searchParams[props.colName] === 'true'
              }
            >
              {(column() as BooleanColumn).optionLabels?.[1]}
            </option>
            <option
              value='false'
              selected={
                props.value === false
                || searchParams[props.colName] === 'false'
              }
            >
              {(column() as BooleanColumn).optionLabels?.[0]}
            </option>
          </select>
        </Match>
        <Match when={column().type === 'fk'}>
          <FkInput
            colName={props.colName}
            column={column() as ForeignKey}
            value={props.value}
          />
        </Match>
        <Match when>
          <input
            name={props.colName}
            value={props.value ?? ''}
            type={inputTypes[column().type]}
            class="border rounded pl-1 w-full"
            autocomplete="off"
          />
        </Match>
      </Switch>
    </label>
  )
}
