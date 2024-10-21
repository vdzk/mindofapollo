import { For, Show, useContext } from "solid-js";
import { Title } from "@solidjs/meta";
import { firstCap, humanCase, nbsp, titleColumnName } from "~/util";
import { PageTitle } from "../components/PageTitle";
import { createAsync, useSearchParams } from "@solidjs/router";
import { SessionContext } from "~/SessionContext";
import { getRecords } from "~/server/api";
import { schema } from "~/schema";

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
      <PageTitle>{title()}</PageTitle>
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
      <Show when={session?.loggedIn()}>
        <a href={`/create-record/?tableName=${sp.tableName}`} class="mx-2 text-sky-800">
          [ + Add ]
        </a>
      </Show>
    </main>
  );
}