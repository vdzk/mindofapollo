import { Title } from "@solidjs/meta";
import { createAsync, useParams } from "@solidjs/router";
import { createEffect, createSignal, Match, Switch, useContext } from "solid-js";
import { schema } from "~/schema";
import { BulkTableView } from "~/components/BulkTableView";
import { ListTableView } from "~/components/ListTableView";
import { Form } from "~/components/Form";
import { SessionContext } from "~/SessionContext";
import { getRecords } from "~/server/api";

export default function Table() {
  const session = useContext(SessionContext)

  const params = useParams();

  const [tableName, setTableName] = createSignal(params.name)

  createEffect(() => setTableName(params.name))

  const records = createAsync(() => getRecords(tableName()))

  const tableSchema = () => schema.tables[tableName()]
  

  return (
    <main>
      
      <Title>{tableName()}</Title>
      <h1 class="text-2xl px-2 py-4">{tableSchema().title ?? params.name}</h1>
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
          <Form tableName={tableName()} />
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
    </main>
  );
}