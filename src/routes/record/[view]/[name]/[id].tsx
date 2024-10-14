import { Title } from "@solidjs/meta";
import { action, cache, createAsync, redirect, useAction, useParams } from "@solidjs/router";
import { createEffect, createSignal, For, Show, useContext } from "solid-js";
import { schema } from "~/schema";
import { getRecords } from "~/server/api";
import { deleteById, getRecordById } from "~/server/db";
import { SessionContext } from "~/SessionContext";

const _delete = action(async (
  tableName: string,
  id: string
) => {
  await deleteById(tableName, id)
  throw redirect(
    `/table/list/${tableName}`,
    { revalidate: getRecords.keyFor(tableName) }
  );
})

export default function Record() {
  const session = useContext(SessionContext)
  const params = useParams();
  const deleteAction = useAction(_delete);
  //TODO: remove this param + signal + effect bloat
  const [tableName, setTableName] = createSignal(params.name)
  createEffect(() => setTableName(params.name))
  const [id, setId] = createSignal(params.id)
  createEffect(() => setId(params.id))

  const getRecord = cache(getRecordById, 'getRecords' + tableName() + id())
  const record = createAsync(() => getRecord(tableName(), id()))

  const onDelete = () => deleteAction(tableName(), id())

  const columns = () => schema.tables[tableName()].columns
  const columnEntries = () => Object.entries(columns())
  const titleColumnName = () => columnEntries()[0][0]
  
  return (
    <main>
      <Title>{record()?.[titleColumnName()]}</Title>
      <For each={columnEntries()}>
        {([colName, column]) => (
          <div class="px-2">
            <div class="font-bold">{column.label ?? colName}</div>
            <div>{record()?.[colName]}</div> 
          </div>
        )}
      </For>
      <Show when={session!.loggedIn()}>
        <div>
          <a href={`/record/edit/${tableName()}/${id()}`} class="mx-2 text-sky-800">
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