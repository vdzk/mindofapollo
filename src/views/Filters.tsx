import { Component, For, Setter, Show } from "solid-js";
import { etv } from "~/client-only/util";
import { schema } from "~/schema/schema";
import { OptionColumn } from "~/schema/type";
import { humanCase } from "~/utils/string";

export const Filters: Component<{
  tableName: string
  filters: Record<string, string>
  setFilters: Setter<Record<string, string>>
}> = props => {
  const filterColumns = () =>
    Object.entries(schema.tables[props.tableName].columns)
      .filter((entry): entry is [string, OptionColumn] =>
        entry[1].type === 'option'
      )

  const updateFilter = (val: string, colName: string) => {
    props.setFilters(prevFilters => {
      const newFilters = {...prevFilters}
      if (val) {
        newFilters[colName] = val
      } else {
        delete newFilters[colName] 
      }
      return newFilters
    })
  }

  return (
    <Show when={filterColumns().length > 0}>
      <div class="px-2 pb-2 flex gap-2">
        <span class='font-bold'>Filters:</span> 
        <For each={filterColumns()}>
          {([colName, column]) => (
            <select
              name={colName}
              onChange={etv(updateFilter)}
            >
              <option
                value=''
                selected={!(colName in props.filters)}
              >
                {humanCase(colName)} (all)
              </option>
              <For each={column.options}>
                {option => (
                  <option
                    value={option}
                    selected={props.filters[colName] === option}
                  >
                    {option}
                  </option>
                )}
              </For>
            </select>
          )}
        </For>
      </div>
    </Show>
  )
}