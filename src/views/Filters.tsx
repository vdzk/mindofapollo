import { Component, For, Show } from "solid-js";
import { schema } from "~/schema/schema";
import { OptionColumn } from "~/schema/type";
import { humanCase } from "~/utils/string";

export const Filters: Component<{ tableName: string }> = props => {
  const filterColumns = () =>
    Object.entries(schema.tables[props.tableName].columns)
      .filter((entry): entry is [string, OptionColumn] =>
        entry[1].type === 'option'
      )

  return (
    <Show when={filterColumns().length > 0}>
      <div class="px-2 pb-2 flex gap-2">
        <For each={filterColumns()}>
          {([colName, column]) => (
            <select>
              <option>{humanCase(colName)} (all)</option>
              <For each={column.options}>
                {option => <option
                  value={option}
                >{option}</option>}
              </For>
            </select>
          )}
        </For>
      </div>
    </Show>
  )
}