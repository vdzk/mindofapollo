import { Component, For } from "solid-js";
import { ExplData } from "../types";
import { firstCap, humanCase } from "~/utils/string";
import { Link } from "~/components/Link";

export const InsertedFkEntries: Component<ExplData> = (props) => {
  return (
    <div class="pl-2">
      <For each={Object.entries(props.insertedFkEntries ?? [])}>
        {([aggregateName, { tableName, options }]) => (
          <>
            <div class="font-bold">
              {firstCap(humanCase(aggregateName))}
            </div>
            <For each={options}>
              {option => (
                <Link
                  label={option.label}
                  route="show-record"
                  params={{ tableName, id: option.id }}
                  class="block"
                />
              )}
            </For>
          </>
        )}
      </For>
    </div>
  )
}