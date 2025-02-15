import { Component } from "solid-js";
import { DataLiteral } from "~/schema/type";
import { schema } from "~/schema/schema";
import { debounce } from "@solid-primitives/scheduled";

export interface TextInputProps {
  value: DataLiteral | undefined;
  onChange: (event: { target: { value: string; name: string } }) => void;
  tableName: string;
  colName: string;
}

export const TextInput: Component<TextInputProps> = (props) => {
  const column = () => schema.tables[props.tableName].columns[props.colName];
  const isReadonly = () => column().type === 'virtual';
  const displayValue = () => (props.value ?? '') + '';
  const onInput = debounce(props.onChange, 500);

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
    />
  );
};