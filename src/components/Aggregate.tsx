import { AccessorWithLatest, createAsync } from "@solidjs/router";
import postgres from "postgres";
import { Component, For, Match, Switch } from "solid-js";
import { schema } from "~/schema";
import { AggregateSchema, NToNSchema, OneToNSchema } from "~/schema.type";
import { listForeignRecords } from "~/server/db";
import { listCrossRecords } from "~/server/cross.db";
import { firstCap, humanCase, nbsp, titleColumnName } from "~/util";

export const Aggregate: Component<{
  tableName: string;
  id: string;
  aggregateName: string;
}> = (props) => {
  const aggregate = schema.tables[props.tableName].aggregates?.[props.aggregateName] as AggregateSchema

  let records: AccessorWithLatest<postgres.RowList<postgres.Row[]> | undefined>
  if (aggregate.type === '1-n') {
    records = createAsync(() => listForeignRecords(aggregate.table, aggregate.column, props.id))
  } else {
    records = createAsync(() => listCrossRecords(aggregate.table, props.tableName, props.id, aggregate.first))
  }

  const aggregateTable = schema.tables[aggregate.table]
  return (
    <section class="pb-2">
      <div class="px-2 font-bold">{firstCap(aggregateTable.plural)}</div>
      <For each={records()}>{(record) => (
        <div class="px-2">
          <a
            href={`/show-record?tableName=${aggregate.table}&id=${record.id}`}
            class="hover:underline"
          >
            {record[titleColumnName(aggregate.table)] || nbsp}
          </a>
        </div>
      )}</For>
      <Switch>
        <Match when={aggregate.type === '1-n'}>
            <a class="mx-2 text-sky-800" href={
            `/create-record?tableName=${aggregate.table}?${(aggregate as OneToNSchema).column}=${props.id}`
          }>[ + Add {humanCase(aggregate.table)} ]</a>
        </Match>
        <Match when={aggregate.type === 'n-n'}>
            <a class="mx-2 text-sky-800" href={
            `/edit-cross-ref?a=${props.tableName}&b=${aggregate.table}&id=${props.id}&first=${(aggregate as NToNSchema).first || ''}`
          }>[ Edit {humanCase(aggregateTable.plural)} ]</a>
        </Match>
      </Switch>
    </section>
  )
}