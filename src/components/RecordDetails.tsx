import { createAsync } from "@solidjs/router";
import { Component, For, Show } from "solid-js";
import { RecordHistory } from "~/components/RecordHistory";
import { schema } from "~/schema/schema";
import { ColumnSchema } from "~/schema/type";
import { getExtRecordById } from "~/server/extRecord.db";
import { getExtTableName } from "~/util";
import { Aggregate } from "../components/Aggregate";
import { Detail, DetailProps } from "./Detail";

export type ColumnFilter = (
  colName: string,
  column: ColumnSchema,
  visible: boolean
) => boolean

export const RecordDetails: Component<{
  tableName: string
  id: number
  displayColumn: ColumnFilter
  showHistory?: boolean
}> = props => {
  const record = createAsync(() => getExtRecordById(props.tableName, props.id))
  const extTableName = () => record() ? getExtTableName(props.tableName, record()!) : undefined
  const table = () => schema.tables[props.tableName]

  const aggregatesNames = () => Object.keys(table().aggregates ?? {})
  const extAggregatesNames = () => {
    const etn = extTableName()
    return etn ? Object.keys(schema.tables[etn].aggregates ?? {}) : []
  }

  const columnFilter = ({tableName, colName, record}: DetailProps) => {
    const column = schema.tables[tableName].columns[colName]
    const visible = ((record && column.getVisibility?.(record)) ?? true);
    return props.displayColumn(colName, column, visible)
  }

  const details = () => record()
    ? [props.tableName, extTableName()]
      .map(tableName => tableName
        ? Object.keys(schema.tables[tableName].columns)
          .map(colName => ({tableName, colName, record: record()!}))
        : []
      ).flat().filter(columnFilter)
    : []

  return (
    <>
      <For each={details()}>
        {detail => <Detail {...detail} />}
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
      <Show when={props.showHistory}>
        <RecordHistory tableName={props.tableName} recordId={props.id} />
      </Show>
    </>
  );
}
