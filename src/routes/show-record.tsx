import { Title } from "@solidjs/meta";
import { action, createAsync, redirect, useAction, useSearchParams } from "@solidjs/router";
import { Component, For, Match, Show, Switch, useContext } from "solid-js";
import { schema } from "~/schema/schema";
import { BooleanColumn, ForeignKey } from "~/schema/type";
import { getRecords } from "~/server/api";
import { getRecordById } from "~/server/select.db";
import { SessionContext } from "~/SessionContext";
import { ColumnLabel } from "../components/ColumnLabel";
import { getExtTableName, nbsp, titleColumnName } from "~/util";
import { RecordPageTitle } from "../components/PageTitle";
import { Aggregate } from "../components/Aggregate";
import { deleteExtById, getExtRecordById } from "~/server/extRecord.db";
import { RecordHistory } from "~/components/RecordHistory";
import { UserHistory } from "~/components/UserHistory";
import { Actions } from "~/components/Actions";

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
  id: number
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
  id: number
}

export default function ShowRecord() {
  const [sp] = useSearchParams() as unknown as [ShowRecord]
  const session = useContext(SessionContext)

  const record = createAsync(() => getExtRecordById(sp.tableName, sp.id))
  const extTableName = () => record() ? getExtTableName(sp.tableName, record()!) : undefined
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
  const columnEntries = () => {
    const _record = record()
    return Object.entries({...columns(), ...extColumns()})
      .filter(([colName, column]) => (colName !== titleColName() // show non-title
      || titleColumn().type === 'fk') // and title that is foreign key 
      && ((_record && column.getVisibility?.(_record)) ?? true))  // visibility is on
  }

  const deleteAction = useAction(_delete);
  const onDelete = () => deleteAction(sp.tableName, sp.id)
  const titleText = () => (record()?.[titleColName()] ?? '') as string

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
                  id={record()?.[colName] as number}
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
      <RecordHistory tableName={sp.tableName} recordId={sp.id} />
      <Show when={sp.tableName === 'person'}>
        <UserHistory userId={sp.id}/>
      </Show>
      <Show when={session!.loggedIn()}>
        <Show when={record()}>
          <Actions tableName={sp.tableName} recordId={record()!.id} />
        </Show>
        <div>
          <a href={`/edit-record?tableName=${sp.tableName}&id=${sp.id}`} class="mx-2 text-sky-800">
            [ Edit ]
          </a>
          <Show when={!table().deny?.includes('DELETE')}>
            <button class="mx-2 text-sky-800" onClick={onDelete}>
              [ Delete ]
            </button>
          </Show>
        </div>
      </Show>
    </main>
  );
}
