import { Title } from "@solidjs/meta"
import { For } from "solid-js"
import { PageTitle } from "~/components/PageTitle"
import { schema } from "~/schema/schema"
import { firstCap, pluralTableName, titleColumnName } from "~/util"

export default function AdminTools() {
  const tableNames = Object.entries(schema.tables)
    .filter(([tableName, tableSchema]) =>
      tableSchema.columns[titleColumnName(tableName)].type !== 'fk'
      && !tableSchema.extendsTable
    )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tableName]) => tableName)

  return (
    <main>
      <Title>Admin Tools</Title>
      <PageTitle>Tables</PageTitle>
      <div class="px-2 max-w-screen-sm flex flex-wrap">
        <For each={tableNames}>
          {(tableName) => (
            <a href={`/list-records?tableName=${tableName}`} class="mr-1 text-sky-800">
              [ {firstCap(pluralTableName(tableName))} ]
            </a>
          )}
        </For>
      </div>
    </main>
  )
}