import { Component, For } from "solid-js";
import { etv } from "~/client-only/util";
import { DataRecordWithId } from "~/schema/type";


export const RecordSelect: Component<{
  selectedId: string;
  setSelectedId: (id: string) => void;
  records?: DataRecordWithId[];
  labelField: string;
  canCreateNew?: boolean;
}> = props => {
  return (
    <select
      value={props.selectedId}
      onChange={etv(props.setSelectedId)}
      class="min-w-0 max-w-full"
    >
      <option value="">
        {props.canCreateNew ? '...or select existing' : 'Select...'}
      </option>
      <For each={props.records}>
        {r => <option value={r.id}>{r[props.labelField]}</option>}
      </For>
    </select>
  );
};
