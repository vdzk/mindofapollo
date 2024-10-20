import { createAsync } from "@solidjs/router";
import { Component, For } from "solid-js";
import { AggregateSchema, schema } from "~/schema";
import { listForeignRecords } from "~/server/db";
import { firstCap, humanCase, nbsp, titleColumnName } from "~/util";

export const Aggregate: Component<{
  tableName: string;
  id: string;
  aggregateName: string;
}> = (props) => {
  const aggregate = schema.tables[props.tableName].aggregates?.[props.aggregateName] as AggregateSchema
  const records = createAsync(() => listForeignRecords(aggregate.table, aggregate.column, props.id))
  const aggregateTable = schema.tables[aggregate.table]
  return (
    <section class="pb-2">
      <div class="px-2 font-bold">{firstCap(aggregateTable.plural)}</div>
      <For each={records()}>{(record) => (
        <div class="px-2">
          <a
            href={`/record/detail/${aggregate.table}/${record.id}`}
            class="hover:underline"
          >
            {record[titleColumnName(aggregate.table)] || nbsp}
          </a>
        </div>
      )}</For>
      <a class="mx-2 text-sky-800" href={
        `/table/create/${aggregate.table}?${aggregate.column}=${props.id}`
      }>[ + Add {humanCase(aggregate.table)} ]</a>
    </section>
  )
}