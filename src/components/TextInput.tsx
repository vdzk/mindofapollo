import { Component } from "solid-js";
import { DataLiteral } from "~/schema/type";
import { schema } from "~/schema/schema";
import { debounce } from "@solid-primitives/scheduled";

export interface TextInputProps {
  value: DataLiteral | undefined;
  onChange: (event: { target: { value: string; name: string } }) => void;
  tableName: string;
  colName: string;
  placeholder?: string;
  disabled?: boolean;
  onKeyDown?: (e: KeyboardEvent) => void;
}

export const TextInput: Component<TextInputProps> = (props) => {
  const column = () => schema.tables[props.tableName].columns[props.colName];
  const isReadonly = () => column().type === 'virtual';
  const displayValue = () => (props.value ?? '') + '';
  const onInput = debounce(props.onChange, 500);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      props.onChange({ target: { value: displayValue(), name: props.colName } });
    }
  };

  return (
    <input
      name={props.colName}
      value={displayValue()}
      type="text"
      class="border rounded pl-1 w-full"
      autocomplete="off"
      readonly={isReadonly()}
      onChange={props.onChange}
      onInput={onInput}
      onKeyDown={props.onKeyDown}
      placeholder={props.placeholder}
      disabled={props.disabled}
    />
  );
};