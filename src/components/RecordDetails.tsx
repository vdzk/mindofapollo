import { createAsync } from "@solidjs/router"
import { Component, For, Show } from "solid-js"
import { schema } from "~/schema/schema"
import { ColumnSchema } from "~/schema/type"
import { getAllKeys } from "~/utils/shape"
import { Aggregate } from "./aggregate/Aggregate"
import { Detail, DetailProps } from "./details"
import { getOneExtRecordByIdCache } from "~/client-only/query"

export type ColumnFilter = (
  colName: string,
  column: ColumnSchema,
  visible: boolean
) => boolean

export const RecordDetails: Component<{
  tableName: string
  id: number
  selectedSection?: string
  displayColumn?: ColumnFilter,
  showAggregates?: boolean
  showExplLinks?: boolean
}> = props => {
  const record = createAsync(() => getOneExtRecordByIdCache(props.tableName, props.id))
  const table = () => schema.tables[props.tableName]

  // TODO: check how to optimise this if necesary
  const fieldsInSection = (tableName: string) => {
    const { columns, aggregates, sections } = schema.tables[tableName]
    if (!sections || !props.selectedSection || props.selectedSection === 'allDetails' || !sections[props.selectedSection]) {
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

  const columnFilter = ({ tableName, colName, record }: DetailProps) => {
    if (!fieldsInSection(tableName).includes(colName)) return false

    const column = schema.tables[tableName].columns[colName]
    const visible = ((record && column.getVisibility?.(record)) ?? true)
    return props.displayColumn?.(colName, column, visible) ?? true
  }

  const details = () => record()
    ? Object.keys(schema.tables[props.tableName].columns)
        .map(colName => ({ 
          tableName: props.tableName, 
          colName, 
          record: record()! 
        }))
        .filter(columnFilter)
    : []
  
  return (
    <>
      <For each={details()}>
        {detail => <Detail {...detail} showExplLink={props.showExplLinks} />}
      </For>
      <Show when={props.showAggregates !== false}>
        <For each={aggregatesNames()} >
          {aggregateName => <Aggregate
            tableName={props.tableName}
            id={props.id}
            aggregateName={aggregateName}
          />}
        </For>
      </Show>
    </>
  );
}
