import { Link } from "~/components/Link";
import { Title } from "@solidjs/meta"
import { For } from "solid-js"
import { PageTitle } from "~/components/PageTitle"
import { schema } from "~/schema/schema"
import { firstCap, humanCase } from "~/utils/string";
import { pluralTableName } from "~/utils/schema";
import { titleColumnName } from "~/utils/schema";
import { argumentTables } from '~/tables/argument'
import { argumentTypeTables } from '~/tables/argument_type'
import { moralityTables } from '~/tables/morality'
import { otherTables } from '~/tables/other'
import { statementTables } from '~/tables/statement'

const tableCategories = {
  statement: Object.keys(statementTables),
  argument: Object.keys(argumentTables),
  argument_type: Object.keys(argumentTypeTables),
  morality: Object.keys(moralityTables),
  other: Object.keys(otherTables)
} as const

function TableList(props: { tables: string[], title: string }) {
  const getLabel = (tableName: string) => {
    if (props.title === 'argument_type') {
      return firstCap(tableName.slice('argument_'.length))
    } else {
      return firstCap(pluralTableName(tableName))
    }
  }
  return (
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-2 px-2 capitalize">{humanCase(props.title)}</h2>
      <div class="px-2 max-w-(--breakpoint-md) flex flex-wrap gap-2">
        <For each={props.tables}>
          {(tableName) => (
            <Link
              route="list-records"
              params={{ tableName }}
              label={getLabel(tableName)}
              type="button"
            />
          )}
        </For>
      </div>
    </div>
  )
}

export default function ListTables() {
  const isValidTable = (tableName: string) => {
    const tableSchema = schema.tables[tableName]
    if (!tableSchema) {
      console.error(`Table ${tableName} not found in schema`)
      return false
    }
    return tableSchema.columns[titleColumnName(tableName)]?.type !== 'fk'
  }

  const getCategoryTables = (category: string) => {
    return tableCategories[category as keyof typeof tableCategories]
      .filter(isValidTable)
      .sort((a, b) => a.localeCompare(b))
  }

  const getUncategorizedTables = () => {
    const allCategorizedTables = Object.values(tableCategories).flat();
    return Object.keys(schema.tables)
      .filter(tableName => !allCategorizedTables.includes(tableName) && isValidTable(tableName))
      .sort((a, b) => a.localeCompare(b))
  }

  const uncategorizedTables = getUncategorizedTables()

  return (
    <main>
      <Title>Tables</Title>
      <PageTitle>Tables</PageTitle>
      <For each={Object.keys(tableCategories)}>
        {(category) => (
          <TableList 
            tables={getCategoryTables(category)} 
            title={category}
          />
        )}
      </For>
      {uncategorizedTables.length > 0 && (
        <TableList 
          tables={uncategorizedTables} 
          title="Uncategorised" 
        />
      )}
    </main>
  )
}