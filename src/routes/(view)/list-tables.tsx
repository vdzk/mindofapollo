import { Link } from "~/components/Link";
import { Title } from "@solidjs/meta"
import { For } from "solid-js"
import { PageTitle } from "~/components/PageTitle"
import { schema } from "~/schema/schema"
import { firstCap, pluralTableName, titleColumnName } from "~/util"

export default function ListTables() {
  const tableNames = Object.entries(schema.tables)
    .filter(([tableName, tableSchema]) =>
      tableSchema.columns[titleColumnName(tableName)].type !== 'fk'
      && !tableSchema.extendsTable
    )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tableName]) => tableName)

  return (
    <main>
      <Title>Tables</Title>
      <PageTitle>Tables</PageTitle>
      <div class="px-2 max-w-screen-md flex flex-wrap">
        <For each={tableNames}>
          {(tableName) => (
            <Link
              route="list-records"
              params={{ tableName }}
              label={firstCap(pluralTableName(tableName))}
              type="button"
            />
          )}
        </For>
      </div>
    </main>
  )
}