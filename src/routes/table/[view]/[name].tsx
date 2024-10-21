import { createAsync, useParams } from "@solidjs/router";
import { createEffect, createSignal, Match, Switch, useContext } from "solid-js";
import { schema } from "~/schema";
import { BulkTableView } from "~/components/BulkTableView";
import { ListTableView } from "~/components/ListTableView";
import { SessionContext } from "~/SessionContext";
import { getRecords } from "~/server/api";
import { CreateRecordView } from "~/components/CreateRecordView";

export default function Table() {
  const session = useContext(SessionContext)

  const params = useParams();

  const [tableName, setTableName] = createSignal(params.name)

  createEffect(() => setTableName(params.name))

  const records = createAsync(() => getRecords(tableName()))

  const tableSchema = () => schema.tables[tableName()]
  

  return (
    <Switch>
      <Match when={params.view === 'list'}>
        <ListTableView
          loggedIn={session!.loggedIn()}
          tableName={tableName()}
          tableSchema={tableSchema()}
          records={records()}
        />
      </Match>
      <Match when={params.view === 'create'}>
        <CreateRecordView tableName={tableName()} />
      </Match>
      <Match when>
        <BulkTableView
          loggedIn={session!.loggedIn()}
          tableName={tableName()}
          tableSchema={tableSchema()}
          records={records()}
        />
      </Match>
    </Switch>
  );
}