import { For, Match, Show, Switch, useContext } from "solid-js";
import { Title } from "@solidjs/meta";
import { firstCap, nbsp, pluralTableName, titleColumnName } from "~/util";
import { PageTitle, PageTitleIcon } from "../../components/PageTitle";
import { action, createAsync, json, useAction, useSearchParams } from "@solidjs/router";
import { SessionContext } from "~/SessionContext";
import { ImList } from 'solid-icons/im'
import { schema } from "~/schema/schema";
import { insertRecord } from "~/api/shared/mutate";
import {getRecords} from "~/api/shared/select";

interface ListRecordProps {
  tableName: string
}

export default function ListRecords() {
  const [sp] = useSearchParams() as unknown as [ListRecordProps]
  const session = useContext(SessionContext)
  const records = createAsync(() => getRecords(sp.tableName))
  const title = () => firstCap(pluralTableName(sp.tableName))
  const canAdd = () => session?.loggedIn()
    && !schema.tables[sp.tableName].deny?.includes('INSERT')
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
        <PageTitleIcon tableName={sp.tableName} />
        <PageTitleIcon component={ImList} />
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
        <Show when={canAdd()}>
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
