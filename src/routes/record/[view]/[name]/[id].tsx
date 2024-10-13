import { Title } from "@solidjs/meta";
import { action, cache, createAsync, redirect, useAction, useParams } from "@solidjs/router";
import { createEffect, createSignal, Show, useContext } from "solid-js";
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
  const [tableName, setTableName] = createSignal(params.name)
  createEffect(() => setTableName(params.name))
  const [id, setId] = createSignal(params.id)
  createEffect(() => setId(params.id))

  const getRecord = cache(getRecordById, 'getRecords' + tableName() + id())
  const record = createAsync(() => getRecord(tableName(), id()))

  const onDelete = () => deleteAction(tableName(), id())

  const titleColumnName = () => Object.keys(schema.tables[tableName()].columns)[0]
  
  return (
    <main>
      <Title>{record()?.[titleColumnName()]}</Title>
      {JSON.stringify(record())}
      <Show when={session!.loggedIn()}>
        <button class="mx-2 text-sky-800" onClick={onDelete}>
          [ Delete ]
        </button>
      </Show>
    </main>
  );
}