import { Title } from "@solidjs/meta";
import { action, redirect, useAction } from "@solidjs/router";
import postgres from "postgres";
import { Component, For, Show, useContext } from "solid-js";
import { schema } from "~/schema";
import { getRecords } from "~/server/api";
import { deleteById } from "~/server/db";
import { SessionContext } from "~/SessionContext";


const _delete = action(async (
  tableName: string,
  id: string
) => {
  await deleteById(tableName, id)
  throw redirect(
    `/table/list/${tableName}`,
    // TODO: this doesn't seem to do anything
    { revalidate: getRecords.keyFor(tableName) }
  );
})

export const DetailRecordView: Component<{
  id: string;
  tableName: string;
  record?: postgres.Row;
}> = (props) => {
  const session = useContext(SessionContext)
  const columns = () => schema.tables[props.tableName].columns
  const columnEntries = () => Object.entries(columns())
  const titleColumnName = () => columnEntries()[0][0]


  const deleteAction = useAction(_delete);
  const onDelete = () => deleteAction(props.tableName, props.id)

  return (
    <main>
      <Title>{props.record?.[titleColumnName()]}</Title>
      <For each={columnEntries()}>
        {([colName, column]) => (
          <div class="px-2">
            <div class="font-bold">{column.label ?? colName}</div>
            <div>{props.record?.[colName]}</div> 
          </div>
        )}
      </For>
      <Show when={session!.loggedIn()}>
        <div>
          <a href={`/record/edit/${props.tableName}/${props.id}`} class="mx-2 text-sky-800">
            [ Edit ]
          </a>
          <button class="mx-2 text-sky-800" onClick={onDelete}>
            [ Delete ]
          </button>
        </div>
      </Show>
    </main>
  );
}