import { Component, Match, Show, Switch } from "solid-js";
import { BooleanColumn, ForeignKey, schema } from "~/schema";
import { FkInput } from "./FkInput";
import { humanCase } from "~/util";
import { ColumnLabel } from "./ColumnLabel";

const inputTypes = {
  varchar: 'text',
  text: 'hidden',
  boolean: 'checkbox',
  integer: 'text',
  fk: 'hidden'
}

export const FormField: Component<{
  tableName: string,
  colName: string,
  value?: any
}> = (props) => {
  const column = schema.tables[props.tableName].columns[props.colName]

  return (
    <label>
      <ColumnLabel colName={props.colName} column={column} />
      <Switch>
        <Match when={column.type === 'text'}>
          <textarea name={props.colName} class="border w-full px-0.5">{props.value}</textarea>
        </Match>
        <Match when={column.type === 'boolean' && column.optionLabels}>
          <select name={props.colName}>
            <Show when={props.value === undefined}>
              <option></option>
            </Show>
            <option value='true' selected={props.value === true}>
              {(column as BooleanColumn).optionLabels?.[1]}
            </option>
            <option value='false' selected={props.value === false}>
              {(column as BooleanColumn).optionLabels?.[0]}
            </option>
          </select>
        </Match>
        <Match when={column.type === 'fk'}>
          <FkInput
            colName={props.colName}
            column={column as ForeignKey}
            value={props.value}
          />
        </Match>
        <Match when>
          <input
            name={props.colName}
            value={props.value ?? ''}
            type={inputTypes[column.type]}
            class="border rounded pl-1"
            autocomplete="off"
          />
        </Match>
      </Switch>
    </label>
  )
}