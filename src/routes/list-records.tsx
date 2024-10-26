import { For, Show, useContext } from "solid-js";
import { Title } from "@solidjs/meta";
import { firstCap, humanCase, nbsp, titleColumnName } from "~/util";
import { PageTitle } from "../components/PageTitle";
import { createAsync, useSearchParams } from "@solidjs/router";
import { SessionContext } from "~/SessionContext";
import { getRecords } from "~/server/api";
import { schema } from "~/schema";
import { Dynamic } from "solid-js/web";
import { ImList } from 'solid-icons/im'

interface ListRecordProps {
  tableName: string
}

export default function ListRecords() {
  const [sp] = useSearchParams() as unknown as [ListRecordProps]
  const session = useContext(SessionContext)
  const records = createAsync(() => getRecords(sp.tableName))
  const title = () => firstCap(humanCase(schema.tables[sp.tableName].plural))

  return (
    <main>
      <Title>{title()}</Title>
      <PageTitle>
        <Dynamic
          component={schema.tables[sp.tableName].icon}
          size={22}
          class="inline mr-1 mb-1"
        />
        <ImList size={20} class="inline mr-1.5 mb-1"/>
        {title()}
      </PageTitle>
      <section>
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
        <Show when={session?.loggedIn()}>
          <a href={`/create-record/?tableName=${sp.tableName}`} class="mx-2 text-sky-800">
            [ + Add ]
          </a>
        </Show>
      </section>
    </main>
  );
}