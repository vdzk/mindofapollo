import { Component, For, Show } from "solid-js";
import { TableSchema } from "~/schema.type";
import postgres from "postgres";
import { Title } from "@solidjs/meta";
import { nbsp, titleColumnName } from "~/util";
import { PageTitle } from "./PageTitle";

export const ListTableView: Component<{
  loggedIn: boolean,
  tableName: string,
  tableSchema: TableSchema,
  records?: postgres.RowList<postgres.Row[]>
}> = (props) => {
  return (
    <main>
      <Title>{props.tableName}</Title>
      <PageTitle>{props.tableSchema.plural}</PageTitle>
      <For each={props.records}>{(record) => (
        <div class="px-2">
          <a
            href={`/record/detail/${props.tableName}/${record.id}`}
            class="hover:underline"
          >
            {record[titleColumnName(props.tableName)] || nbsp}
          </a>
        </div>
      )}</For>
      <Show when={props.loggedIn}>
        <a href={`/table/create/${props.tableName}`} class="mx-2 text-sky-800">
          [ + Add ]
        </a>
      </Show>
    </main>
  );
}