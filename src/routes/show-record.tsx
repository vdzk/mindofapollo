import { Title } from "@solidjs/meta";
import { action, createAsync, redirect, useAction, useSearchParams } from "@solidjs/router";
import { Component, For, Match, Show, Switch, useContext } from "solid-js";
import { schema } from "~/schema/schema";
import { BooleanColumn, ForeignKey } from "~/schema/type";
import { getRecords } from "~/server/api";
import { getRecordById } from "~/server/db";
import { SessionContext } from "~/SessionContext";
import { ColumnLabel } from "../components/ColumnLabel";
import { dbColumnName, getExtTableName, nbsp, titleColumnName } from "~/util";
import { createAsyncFkTitle, RecordPageTitle } from "../components/PageTitle";
import { Aggregate } from "../components/Aggregate";
import { deleteExtById, getExtRecordById } from "~/server/extRecord.db";
import postgres from "postgres";

const FkValue: Component<{
  column: ForeignKey,
  id: number
}> = (props) => {
  const tableName = props.column.fk.table
  const record = createAsync(() => {
    if (props.id === undefined) {
      // TODO: figure out why this happens
      return Promise.resolve(undefined)
    } else {
      return getRecordById(tableName, props.id)
    }
  })

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
  await deleteExtById(tableName, id)
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

  const record = createAsync(() => getExtRecordById(sp.tableName, sp.id))
  const extTableName = () => record() ? getExtTableName(sp.tableName, record() as postgres.Row) : undefined
  const table = () => schema.tables[sp.tableName]

  const columns = () => table().columns
  const extColumns = () => extTableName()
    ? schema.tables[extTableName() as string].columns
    : {}

  const aggregatesNames = () => Object.keys(table().aggregates ?? {})
  const extAggregatesNames = () => {
    const etn = extTableName()
    return etn ? Object.keys(schema.tables[etn].aggregates ?? {}) : []
  }

  const titleColName = () => titleColumnName(sp.tableName)
  const titleColumn = () => columns()[titleColName()]
  const columnEntries = () => Object.entries({...columns(), ...extColumns()})
    .filter(([colName]) => colName !== titleColName() || titleColumn().type === 'fk')

  const deleteAction = useAction(_delete);
  const onDelete = () => deleteAction(sp.tableName, sp.id)
  const titleText = createAsyncFkTitle(() => sp.tableName, record)

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
                <div class="whitespace-pre-line">
                  {record()?.[colName] || nbsp}
                </div>
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
      {/* TODO: check that it works */}
      <For each={extAggregatesNames()} >
        {aggregateName => <Aggregate
          tableName={extTableName() as string}
          id={sp.id}
          aggregateName={aggregateName}
        />}
      </For>
      <Show when={session!.loggedIn()}>
        <div>
          <a href={`/edit-record?tableName=${sp.tableName}&id=${sp.id}`} class="mx-2 text-sky-800">
            [ Edit ]
          </a>
          <Show when={!table().deny?.includes('delete')}>
            <button class="mx-2 text-sky-800" onClick={onDelete}>
              [ Delete ]
            </button>
          </Show>
        </div>
      </Show>
    </main>
  );
}
