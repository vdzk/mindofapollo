import { createAsync } from "@solidjs/router";
import { Component, For, Match, Switch } from "solid-js";
import { RecordHistory } from "~/components/RecordHistory";
import { schema } from "~/schema/schema";
import { BooleanColumn, ColumnSchema, ForeignKey } from "~/schema/type";
import { getExtRecordById } from "~/server/extRecord.db";
import { getRecordById } from "~/server/select.db";
import { getExtTableName, nbsp } from "~/util";
import { Aggregate } from "../components/Aggregate";
import { ColumnLabel } from "../components/ColumnLabel";

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

export type ColumnFilter = (
  colName: string,
  column: ColumnSchema,
  visible: boolean
) => boolean

export const RecordDetails: Component<{
  tableName: string
  id: number
  displayColumn: ColumnFilter
}> = props => {
  const record = createAsync(() => getExtRecordById(props.tableName, props.id))
  const extTableName = () => record() ? getExtTableName(props.tableName, record()!) : undefined
  const table = () => schema.tables[props.tableName]

  const columns = () => table().columns
  const extColumns = () => extTableName()
    ? schema.tables[extTableName() as string].columns
    : {}

  const aggregatesNames = () => Object.keys(table().aggregates ?? {})
  const extAggregatesNames = () => {
    const etn = extTableName()
    return etn ? Object.keys(schema.tables[etn].aggregates ?? {}) : []
  }

  const columnEntries = () => {
    const _record = record()
    return Object.entries({ ...columns(), ...extColumns() })
      .filter(([colName, column]) => {
        const visible = ((_record && column.getVisibility?.(_record)) ?? true);
        return props.displayColumn(colName, column, visible)
      })
  }

  return (
    <>
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
          tableName={props.tableName}
          id={props.id}
          aggregateName={aggregateName}
        />}
      </For>
      {/* TODO: check that it works */}
      <For each={extAggregatesNames()} >
        {aggregateName => <Aggregate
          tableName={extTableName() as string}
          id={props.id}
          aggregateName={aggregateName}
        />}
      </For>
      <RecordHistory tableName={props.tableName} recordId={props.id} />
    </>
  );
}
