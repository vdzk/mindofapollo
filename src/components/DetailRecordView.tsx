import { Title } from "@solidjs/meta";
import { action, createAsync, redirect, useAction } from "@solidjs/router";
import postgres from "postgres";
import { Component, For, Match, Show, Switch, useContext } from "solid-js";
import { BooleanColumn, ForeignKey, schema } from "~/schema";
import { getRecords } from "~/server/api";
import { deleteById, getRecordById } from "~/server/db";
import { SessionContext } from "~/SessionContext";
import { ColumnLabel } from "./ColumnLabel";
import { nbsp, titleColumnName } from "~/util";
import { PageTitle } from "./PageTitle";

const FkValue: Component<{
  column: ForeignKey,
  id: number
}> = (props) => {
  const record = createAsync(() => getRecordById(props.column.fk.table, props.id))

  return (
    <div>{record?.()?.[props.column.fk.labelColumn] ?? nbsp}</div>
  )
}

const _delete = action(async (
  tableName: string,
  id: string
) => {
  await deleteById(tableName, id)
  throw redirect(
    `/table/list/${tableName}`,
    // TODO: this doesn't seem to do anything
    { revalidate: getRecords.keyFor(tableName) }
  );
})

export const DetailRecordView: Component<{
  id: string;
  tableName: string;
  record?: postgres.Row;
}> = (props) => {
  const session = useContext(SessionContext)
  const columns = () => schema.tables[props.tableName].columns
  const columnEntries = () => Object.entries(columns())

  const deleteAction = useAction(_delete);
  const onDelete = () => deleteAction(props.tableName, props.id)

  const childrenTables = []
  for (const tn in schema.tables) {
    for (const cl in schema.tables[tn].columns) {
      const column = schema.tables[tn].columns[cl]
      if (
        column.type === 'fk' &&
        column.fk.table === props.tableName &&
        column.fk.parent
      ) {
        childrenTables.push({tableName: tn, colName: cl})
      }
    }
  }

  return (
    <main>
      <Title>{props.record?.[titleColumnName(props.tableName)]}</Title>
      <PageTitle>{props.tableName}</PageTitle>
      <For each={columnEntries()}>
        {([colName, column]) => (
          <div class="px-2 pb-2">
            <ColumnLabel colName={colName} column={column} />
            <Switch>
              <Match when={column.type === 'fk'}>
                <FkValue
                  column={column as ForeignKey}
                  id={props.record?.[colName]}
                />
              </Match>
              <Match when={column.type === 'boolean' && column.optionLabels}>
                <div>{(column as BooleanColumn).optionLabels?.[props.record?.[colName] ? 1 : 0]}</div> 
              </Match>
              <Match when>
                <div>{props.record?.[colName]}</div> 
              </Match>
            </Switch>
          </div>
        )}
      </For>
      <Show when={session!.loggedIn()}>
        <div>
          <For each={childrenTables}>
            {childTable => (
              <a  class="mx-2 text-sky-800" href={
                `/table/create/${childTable.tableName}?${childTable.colName}=${props.id}`
              }>[ + Add {childTable.tableName} ]</a>
            )}
          </For>
          <a href={`/record/edit/${props.tableName}/${props.id}?`} class="mx-2 text-sky-800">
            [ Edit ]
          </a>
          <button class="mx-2 text-sky-800" onClick={onDelete}>
            [ Delete ]
          </button>
        </div>
      </Show>
    </main>
  );
}