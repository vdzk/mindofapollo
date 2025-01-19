import { For, Match, Show, Switch, useContext } from "solid-js";
import { Title } from "@solidjs/meta";
import { firstCap, nbsp, pluralTableName, titleColumnName } from "~/util";
import { PageTitle } from "../../components/PageTitle";
import { action, createAsync, json, useAction, useSearchParams } from "@solidjs/router";
import { schema } from "~/schema/schema";
import { insertRecord } from "~/api/shared/mutate";
import { getPermission } from "~/getPermission";
import {getRecords} from "~/client-only/query";
import { SessionContext } from "~/SessionContext";

interface ListRecordProps {
  tableName: string
}

export default function ListRecords() {
  const session = useContext(SessionContext)
  const [sp] = useSearchParams() as unknown as [ListRecordProps]
  const records = createAsync(() => getRecords(sp.tableName))
  const premC = () => getPermission(session?.user?.()?.id, 'create', sp.tableName)
  const title = () => firstCap(pluralTableName(sp.tableName))
  const table = () => schema.tables[sp.tableName]

  const addAction = useAction(action(async () => {
    const record = table().createRecord!()
    await insertRecord(sp.tableName, record)
    return json( 'ok', { revalidate: [ getRecords.keyFor(sp.tableName) ] })
  }))

  return (
    <main>
      <Title>{title()}</Title>
      <PageTitle>
        {title()}
      </PageTitle>
      <section class="pb-2">
        <For each={records()}>{(record) => (
          <div class="px-2">
            <a
              href={`/show-record?tableName=${sp.tableName}&id=${record.id}`}
              class="hover:underline"
            >
              {record[titleColumnName(sp.tableName)] || nbsp}
            </a>
          </div>
        )}</For>
      </section>
      <section>
        <Show when={premC()?.granted}>
          <Switch>
            <Match when={table().createRecord}>
              <button
                onClick={addAction}
                class="mx-2 text-sky-800"
              >
                [ + Add ]
              </button>
            </Match>
            <Match when>
              <a
                href={`/create-record/?tableName=${sp.tableName}`}
                class="mx-2 text-sky-800"
              >
                [ + Add ]
              </a>
            </Match>
          </Switch>
        </Show>
      </section>
    </main>
  );
}
