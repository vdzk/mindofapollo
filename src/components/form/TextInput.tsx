import { Component } from "solid-js";
import { DataLiteral } from "~/schema/type";
import { schema } from "~/schema/schema";
import { debounce } from "@solid-primitives/scheduled"
import { GenericInputEvent } from "~/types";

export interface TextInputProps {
  value: DataLiteral | undefined
  onChange: (event: GenericInputEvent) => void
  tableName: string
  colName: string
  placeholder?: string
  disabled?: boolean
  onKeyDown?: (e: KeyboardEvent) => void
  lines?: number
}

export const TextInput: Component<TextInputProps> = (props) => {
  const column = () => schema.tables[props.tableName].columns[props.colName];
  const isReadonly = () => column().type === 'virtual'
  const displayValue = () => (props.value ?? '') + ''
  const onInput = debounce(props.onChange, 500)

  return (
    props.lines ? (
      <textarea
        name={props.colName}
        class="border pl-1 w-full px-0.5"
        autocomplete="off"
        readonly={isReadonly()}
        onChange={props.onChange}
        onInput={onInput}
        onKeyDown={props.onKeyDown}
        placeholder={props.placeholder}
        disabled={props.disabled}
        rows={props.lines}
      >
        {displayValue()}
      </textarea>
    ) : (
      <input
        name={props.colName}
        value={displayValue()}
        type="text"
        class="border rounded-sm pl-1 w-full"
        autocomplete="off"
        readonly={isReadonly()}
        onChange={props.onChange}
        onInput={onInput}
        onKeyDown={props.onKeyDown}
        placeholder={props.placeholder}
        disabled={props.disabled}
      />
    )
  );
};