import { cache, createAsync, revalidate, useNavigate, useParams } from "@solidjs/router";
import { createEffect, createSignal, Show, useContext } from "solid-js";
import { deleteById, getRecordById } from "~/server/db";
import { SessionContext } from "~/SessionContext";

export default function Record() {
  const navigate = useNavigate();
  const session = useContext(SessionContext)
  const params = useParams();
  const [tableName, setTableName] = createSignal(params.name)
  createEffect(() => setTableName(params.name))
  const [id, setId] = createSignal(params.id)
  createEffect(() => setId(params.id))

  const getRecord = cache(getRecordById, 'getRecords' + tableName() + id())
  const record = createAsync(() => getRecord(tableName(), id()))

  const onDelete = async () => {
    await deleteById(tableName(), id())
    revalidate(['getRecords'+ tableName()])
    navigate(`/table/list/${tableName()}`);
  }
  
  return (
    <main>
      {JSON.stringify(record())}
      <Show when={session!.loggedIn()}>
        <button class="mx-2 text-sky-800" onClick={onDelete}>
          [ Delete ]
        </button>
      </Show>
    </main>
  );
}