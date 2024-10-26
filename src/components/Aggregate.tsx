import { createAsync } from "@solidjs/router";
import { Component, For, JSX, Show, useContext } from "solid-js";
import { schema } from "~/schema";
import { AggregateSchema } from "~/schema.type";
import { listForeignRecords, listOverlapRecords, listRecords } from "~/server/db";
import { listCrossRecords } from "~/server/cross.db";
import { nbsp, titleColumnName } from "~/util";
import { crossList, simpleList, splitBoolean, splitFk } from "./aggregators";
import postgres from "postgres";
import { SessionContext } from "~/SessionContext";

export interface AggregateSection {
  title: string;
  records: () => postgres.Row[] | undefined;
  button: JSX.Element;
}

export const Aggregate: Component<{
  tableName: string;
  id: string;
  aggregateName: string;
}> = (props) => {
  const session = useContext(SessionContext)
  const aggregate = schema.tables[props.tableName].aggregates?.[props.aggregateName] as AggregateSchema

  const records = createAsync(() => aggregate.type === '1-n'
    ? listForeignRecords(aggregate.table, aggregate.column, props.id)
    : listCrossRecords(aggregate.table, props.tableName, props.id, !!aggregate.first)
  )

  const aggregateTable = schema.tables[aggregate.table]

  const aggregatorProps = {
    tableName: props.tableName,
    id: props.id,
    aggregateTable,
    aggregate,
    records
  }

  let sections: () => AggregateSection[] = () => []
  if (aggregate.type === '1-n') {
    if (aggregate.splitByColumn) {
      const splitColumn = aggregateTable.columns[aggregate.splitByColumn]
      if (splitColumn.type === 'boolean') {
        sections = () => splitBoolean(aggregatorProps)
      } else if (splitColumn.type === 'fk') {
        const splitRecords = createAsync(() => {
          if (aggregate.filterSplitBy) {
            return listOverlapRecords(
              splitColumn.fk.table,
              aggregate.filterSplitBy,
              props.tableName,
              props.id
            )
          } else {
            return listRecords(splitColumn.fk.table)
          }
        })
        sections = () => splitFk({...aggregatorProps, splitRecords})
      }
    } else {
      sections = () => simpleList(aggregatorProps)
    }
  } else {
    sections = () => crossList(aggregatorProps)
  }

  return (
    <For each={sections()}>
      {section => (
        <section class="pb-2">
          <div class="px-2 font-bold">{section.title}</div>
          <For each={section.records()}>{(record) => (
            <div class="px-2">
              <a
                href={`/show-record?tableName=${aggregate.table}&id=${record.id}`}
                class="hover:underline"
              >
                {record[titleColumnName(aggregate.table)] || nbsp}
              </a>
            </div>
          )}</For>
          <Show when={session?.loggedIn()}>
            {section.button}
          </Show>
        </section>
      )}
    </For>
  )
}