import { Title } from "@solidjs/meta";
import { action, createAsync, redirect, useAction, useSearchParams } from "@solidjs/router";
import { Component, For, Match, Show, Switch, useContext } from "solid-js";
import { schema } from "~/schema";
import { BooleanColumn, ForeignKey } from "~/schema.type";
import { getRecords } from "~/server/api";
import { deleteById, getRecordById } from "~/server/db";
import { SessionContext } from "~/SessionContext";
import { ColumnLabel } from "../components/ColumnLabel";
import { nbsp, titleColumnName } from "~/util";
import { RecordPageTitle } from "../components/PageTitle";
import { Aggregate } from "../components/Aggregate";

const FkValue: Component<{
  column: ForeignKey,
  id: number
}> = (props) => {
  const tableName = props.column.fk.table
  const record = createAsync(() => getRecordById(tableName, props.id))

  return (
    <div>
      <a
        class="hover:underline"
        href={`/show-record?tableName=${tableName}&id=${props.id}`}
      >
        {record?.()?.[props.column.fk.labelColumn] ?? nbsp}
      </a>
    </div>
  )
}

const _delete = action(async (
  tableName: string,
  id: string
) => {
  await deleteById(tableName, id)
  throw redirect(
    `/list-records?tableName=${tableName}`,
    // TODO: this doesn't seem to do anything
    { revalidate: getRecords.keyFor(tableName) }
  );
})

interface ShowRecord {
  tableName: string
  id: string
}

export default function ShowRecord() {
  const [sp] = useSearchParams() as unknown as [ShowRecord]
  const session = useContext(SessionContext)
  const columns = () => schema.tables[sp.tableName].columns
  const aggregatesNames = () => Object.keys(schema.tables[sp.tableName].aggregates ?? {})
  const columnEntries = () => Object.entries(columns())
    .filter(([colName]) => colName !== titleColumnName(sp.tableName))

  const deleteAction = useAction(_delete);
  const onDelete = () => deleteAction(sp.tableName, sp.id)
  const record = createAsync(() => getRecordById(sp.tableName, sp.id))
  const titleText = () => record()?.[titleColumnName(sp.tableName)]

  return (
    <main>
      <Title>{titleText()}</Title>
      <RecordPageTitle tableName={sp.tableName} text={titleText()} />
      <For each={columnEntries()}>
        {([colName, column]) => (
          <div class="px-2 pb-2">
            <ColumnLabel colName={colName} column={column} />
            <Switch>
              <Match when={column.type === 'fk'}>
                <FkValue
                  column={column as ForeignKey}
                  id={record()?.[colName]}
                />
              </Match>
              <Match when={column.type === 'boolean' && column.optionLabels}>
                <div>{(column as BooleanColumn).optionLabels?.[record()?.[colName] ? 1 : 0]}</div> 
              </Match>
              <Match when>
                <div>{record()?.[colName] || nbsp}</div> 
              </Match>
            </Switch>
          </div>
        )}
      </For>
      <For each={aggregatesNames()} >
        {aggregateName => <Aggregate
          tableName={sp.tableName}
          id={sp.id}
          aggregateName={aggregateName}
        />}
      </For>
      <Show when={session!.loggedIn()}>
        <div>
          <a href={`/edit-record?tableName=${sp.tableName}&id=${sp.id}`} class="mx-2 text-sky-800">
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