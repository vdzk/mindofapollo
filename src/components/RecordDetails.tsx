import { createAsync } from "@solidjs/router";
import { Component, For, useContext } from "solid-js";
import { schema } from "~/schema/schema";
import { ColumnSchema } from "~/schema/type";
import { getOneExtRecordById } from "~/api/shared/extRecord";
import { getAllKeys, getExtTableName } from "~/util";
import { Aggregate } from "../components/Aggregate";
import { Detail, DetailProps } from "./details";
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
  selectedSection?: string
  displayColumn?: ColumnFilter
}> = props => {
  const session = useContext(SessionContext)
  const record = createAsync(() => getOneExtRecordById(props.tableName, props.id))
  const extTableName = () => record() ? getExtTableName(props.tableName, record()!) : undefined
  const table = () => schema.tables[props.tableName]
  const permission = () => getPermission(session?.userSession?.(), 'read', props.tableName, props.id)

  // TODO: check how to optimise this if necesary
  const fieldsInSection = (tableName: string) => {
    const { columns, aggregates, sections } = schema.tables[tableName]
    if (!sections || !props.selectedSection || props.selectedSection === 'allDetails') {
      return getAllKeys([columns, aggregates])
    } else {
      const { fields } = sections[props.selectedSection]
      if (fields) {
        return fields
      } else {
        // return all of the remaining fields
        let excludeFields: string[] = []
        for (const key in sections) {
          const { fields } = sections[key]
          if (fields) {
            excludeFields = [...excludeFields, ...fields]
          }
        }
        return getAllKeys([columns, aggregates]).filter(key => !excludeFields.includes(key))
      }
    }
  }

  const aggregatesNames = () => Object.keys(table().aggregates ?? {})
    .filter(name => fieldsInSection(props.tableName).includes(name))

  const extAggregatesNames = () => {
    const etn = extTableName()
    return etn ? Object.keys(schema.tables[etn].aggregates ?? {}) : []
  }

  const columnFilter = ({ tableName, colName, record }: DetailProps) => {
    const perm = permission()
    if (perm.colNames && !perm.colNames.includes(colName)) return false
    if (!fieldsInSection(tableName).includes(colName)) return false

    const column = schema.tables[tableName].columns[colName]
    const visible = ((record && column.getVisibility?.(record)) ?? true)
    return props.displayColumn?.(colName, column, visible) ?? true
  }

  const details = () => record()
    ? [props.tableName, extTableName()]
      .map(tableName => tableName
        ? Object.keys(schema.tables[tableName].columns)
          .map(colName => ({ tableName, colName, record: record()! }))
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
    </>
  );
}
