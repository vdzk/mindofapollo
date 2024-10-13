import { Component, For, Show } from "solid-js";
import { TableSchema } from "~/schema";
import postgres from "postgres";

export const ListTableView: Component<{
  loggedIn: boolean,
  tableName: string,
  tableSchema: TableSchema,
  records?: postgres.RowList<postgres.Row[]>
}> = (props) => {
  const titleColumnName = () => Object.keys(props.tableSchema.columns)[0]

  return (
    <>
      <For each={props.records}>{(record) => (
        <div class="px-2">
          <a
            href={`/record/detail/${props.tableName}/${record.id}`}
            class="hover:underline"
          >
            {record[titleColumnName()]}
          </a>
        </div>
      )}</For>
      <Show when={props.loggedIn}>
        <a href={`/table/create/${props.tableName}`} class="mx-2 text-sky-800">
          [ + Add ]
        </a>
      </Show>
    </>
  );
}