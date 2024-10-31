import { createAsync } from "@solidjs/router";
import postgres from "postgres";
import { IconTypes } from "solid-icons";
import { Component, ParentComponent } from "solid-js";
import { Dynamic } from "solid-js/web";
import { schema } from "~/schema/schema";
import { ForeignKey } from "~/schema/type";
import { getRecordById } from "~/server/db";
import { dbColumnName, firstCap, humanCase, titleColumnName } from "~/util";

export const PageTitle: ParentComponent = (props) => {
  return (
    <h1 class="text-3xl font-bold px-2 py-4 first-letter:uppercase">{props.children}</h1>
  )
}

export const PageTitleIcon: Component<{
  tableName?: string;
  component?: IconTypes
}> = props => (
  <Dynamic
    component={props.tableName
      ? schema.tables[props.tableName].icon
      : props.component
    }
    size={28}
    class="inline mr-2 mb-1"
  />
)

export const RecordPageTitle: Component<{
  tableName: string,
  text: string
}> = props => (
  <div>
    <div class="relative top-5 pl-2.5">{firstCap(humanCase(props.tableName))}:</div>
    <PageTitle>

      <PageTitleIcon tableName={props.tableName} />
      {props.text}
    </PageTitle>
  </div>
)

export const createAsyncFkTitle = (
  tableName: () => string,
  record: () => postgres.Row | undefined
) => createAsync(async () => {
  const titleColName = titleColumnName(tableName())
  const titleColumn = schema.tables[tableName()].columns[titleColName]

  if (titleColumn.type === 'fk') {
    const titleDbColName = dbColumnName(tableName(), titleColName)
    const fkId = record()?.[titleDbColName]
    if (fkId) {
      const fkRecord = await getRecordById(
        (titleColumn as ForeignKey).fk.table,
        record()?.[titleDbColName]
      )
      return fkRecord?.[titleColumn.fk.labelColumn]
    } else {
      return undefined
    }
  } else {
    return record()?.[titleColName]
  }
})
