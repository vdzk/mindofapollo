import { createAsync } from "@solidjs/router";
import { Component, For, Show, useContext } from "solid-js";
import { RecordHistory } from "~/components/histories";
import { schema } from "~/schema/schema";
import { ColumnSchema } from "~/schema/type";
import { getExtRecordById } from "~/api/shared/extRecord";
import { getExtTableName } from "~/util";
import { Aggregate } from "../components/Aggregate";
import { Detail, DetailProps } from "./Detail";
import { getPermission } from "~/getPermission";
import { SessionContext } from "~/SessionContext";

export type ColumnFilter = (
  colName: string,
  column: ColumnSchema,
  visible: boolean
) => boolean

export const RecordDetails: Component<{
  tableName: string
  id: number
  displayColumn?: ColumnFilter
  showHistory?: boolean
}> = props => {
  const session = useContext(SessionContext)
  const userId = () => session?.user?.()?.id
  const record = createAsync(() => getExtRecordById(props.tableName, props.id))
  const extTableName = () => record() ? getExtTableName(props.tableName, record()!) : undefined
  const table = () => schema.tables[props.tableName]
  const permission = () => getPermission(userId() ,'read', props.tableName, props.id)

  const aggregatesNames = () => Object.keys(table().aggregates ?? {})
  const extAggregatesNames = () => {
    const etn = extTableName()
    return etn ? Object.keys(schema.tables[etn].aggregates ?? {}) : []
  }

  const columnFilter = ({tableName, colName, record}: DetailProps) => {
    const perm = permission()
    if (perm.colNames && !perm.colNames.includes(colName)) return false
    
    const column = schema.tables[tableName].columns[colName]
    const visible = ((record && column.getVisibility?.(record)) ?? true);
    return props.displayColumn?.(colName, column, visible) ?? true
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
