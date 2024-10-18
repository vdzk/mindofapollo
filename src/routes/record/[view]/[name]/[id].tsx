import { cache, createAsync, redirect, useAction, useParams } from "@solidjs/router";
import { createEffect, createSignal, For, Match, Show, Switch, useContext } from "solid-js";
import { DetailRecordView } from "~/components/DetailRecordView";
import { EditRecordView } from "~/components/EditRecordView";
import { getRecordById } from "~/server/db";

export default function Record() {
  const params = useParams();
  //TODO: remove this param + signal + effect bloat
  const [tableName, setTableName] = createSignal(params.name)
  createEffect(() => setTableName(params.name))
  const [id, setId] = createSignal(params.id)
  createEffect(() => setId(params.id))

  const getRecord = cache(getRecordById, 'getRecords' + tableName() + id())
  const record = createAsync(() => getRecord(tableName(), id()))

  
  return (
    <Switch>
      <Match when={params.view === 'edit'}>
        <EditRecordView
          record={record()}
          id={id()}
          tableName={tableName()}
        />
      </Match>
      <Match when={params.view === 'detail'}>
        <DetailRecordView
          record={record()}
          id={id()}
          tableName={tableName()}
        />
      </Match>
    </Switch>
  )
}