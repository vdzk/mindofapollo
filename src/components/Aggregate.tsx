import { AccessorWithLatest, createAsync } from "@solidjs/router";
import postgres from "postgres";
import { Component, For, Match, Switch } from "solid-js";
import { schema } from "~/schema";
import { AggregateSchema, BooleanColumn, NToNSchema, OneToNSchema } from "~/schema.type";
import { listForeignRecords } from "~/server/db";
import { listCrossRecords } from "~/server/cross.db";
import { firstCap, humanCase, nbsp, titleColumnName } from "~/util";

export const Aggregate: Component<{
  tableName: string;
  id: string;
  aggregateName: string;
}> = (props) => {
  const aggregate = schema.tables[props.tableName].aggregates?.[props.aggregateName] as AggregateSchema

  const records = createAsync(() => aggregate.type === '1-n'
    ? listForeignRecords(aggregate.table, aggregate.column, props.id)
    : listCrossRecords(aggregate.table, props.tableName, props.id, !!aggregate.first)
  )

  const aggregateTable = schema.tables[aggregate.table]

  const sections = () => {
    if (aggregate.type === '1-n') {
      if (aggregate.splitByColumn) {
        const splitColumn = aggregateTable.columns[aggregate.splitByColumn] as BooleanColumn
        // Assumes boolean column with optionLabels
        const result = []
        for (const value of [true, false]) {
          const label = splitColumn.optionLabels?.[value ? 1 : 0]
          result.push({
            title: label + ' ' + aggregateTable.plural,
            records: () => records()
              ?.filter(r => r[aggregate.splitByColumn as string] === value),
            button: <a
              class="mx-2 text-sky-800"
              href={`/create-record`
                + `?tableName=${aggregate.table}`
                + `&sourceTable=${props.tableName}`
                + `&sourceId=${props.id}`
                + `&${(aggregate as OneToNSchema).column}=${props.id}`
                + `&${aggregate.splitByColumn}=${value + ''}`
              }
            >[ + Add {label?.toLocaleLowerCase()} {humanCase(aggregate.table)} ]</a>
          })
        }
        return result
      } else {
        return [{
          title: firstCap(aggregateTable.plural),
          records,
          button: <a
            class="mx-2 text-sky-800"
            href={`/create-record`
              + `?tableName=${aggregate.table}`
              + `&sourceTable=${props.tableName}`
              + `&sourceId=${props.id}`
              + `&${(aggregate as OneToNSchema).column}=${props.id}`
            }
          >[ + Add {humanCase(aggregate.table)} ]</a>
        }]
      }
    } else {
      return [{
        title: firstCap(aggregateTable.plural),
        records,
        button: <a
          class="mx-2 text-sky-800"
          href={`/edit-cross-ref`
            + `?a=${props.tableName}`
            + `&b=${aggregate.table}`
            + `&id=${props.id}`
            + `&first=${(aggregate as NToNSchema).first || ''}`
          }>[ Edit {humanCase(aggregateTable.plural)} ]</a>
      }]
    }
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
          {section.button}
        </section>
      )}
    </For>
  )
}