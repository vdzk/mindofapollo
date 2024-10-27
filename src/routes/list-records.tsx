import { For, Show, useContext } from "solid-js";
import { Title } from "@solidjs/meta";
import { firstCap, nbsp, pluralTableName, titleColumnName } from "~/util";
import { PageTitle, PageTitleIcon } from "../components/PageTitle";
import { createAsync, useSearchParams } from "@solidjs/router";
import { SessionContext } from "~/SessionContext";
import { getRecords } from "~/server/api";
import { ImList } from 'solid-icons/im'
import { schema } from "~/schema/schema";

interface ListRecordProps {
  tableName: string
}

export default function ListRecords() {
  const [sp] = useSearchParams() as unknown as [ListRecordProps]
  const session = useContext(SessionContext)
  const records = createAsync(() => getRecords(sp.tableName))
  const title = () => firstCap(pluralTableName(sp.tableName))
  const canAdd = () => session?.loggedIn()
    && !schema.tables[sp.tableName].deny?.includes('insert')

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
          <a href={`/create-record/?tableName=${sp.tableName}`} class="mx-2 text-sky-800">
            [ + Add ]
          </a>
        </Show>
      </section>
    </main>
  );
}
