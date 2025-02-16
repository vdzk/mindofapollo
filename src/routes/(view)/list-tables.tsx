import { Link } from "~/components/Link";
import { Title } from "@solidjs/meta"
import { For } from "solid-js"
import { PageTitle } from "~/components/PageTitle"
import { schema } from "~/schema/schema"
import { firstCap, pluralTableName, titleColumnName } from "~/util"

// Group tables by their category based on folder structure
const tableCategories = {
  statement: ['statement'],
  argument: ['argument', 'argument_type', 'argument_analogy', 'argument_authority', 'argument_other', 'argument_judgement', 'argument_conditional', 'argument_weight', 'argument_aggregation_type'],
  morality: ['deed', 'directive', 'directive_consequence', 'directive_scope', 'moral_good', 'moral_persuasion', 'moral_weight', 'person_category', 'presuasion_critique', 'unit'],
  other: ['authorization_category', 'person', 'tag', 'critical_question', 'critical_statement', 'research_note', 'confirmation', 'role', 'rule', 'rule_change_request', 'change_proposal', 'invite']
}

function TableList(props: { tables: string[], title?: string }) {
  return (
    <div class="mb-6">
      {props.title && (
        <h2 class="text-xl font-semibold mb-2 px-2 capitalize">{props.title}</h2>
      )}
      <div class="px-2 max-w-screen-md flex flex-wrap gap-2">
        <For each={props.tables}>
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
    </div>
  )
}

export default function ListTables() {
  const isValidTable = (tableName: string) => {
    const tableSchema = schema.tables[tableName]
    return tableSchema.columns[titleColumnName(tableName)]?.type !== 'fk' 
      && !tableSchema.extendsTable
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