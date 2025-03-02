import { Component, For } from "solid-js"
import { schema } from "~/schema/schema"
import { DataRecord } from "~/schema/type"
import { Detail } from "../details"

export const ExplRecordDetails: Component<{
  tableName: string,
  record: DataRecord
}> = (props) => {
  const colNames = () => ['id', ...Object.keys(schema.tables[props.tableName].columns)].filter(colName => colName in props.record)
  return (
    <For each={colNames()}>
      {colName => <Detail
        tableName={props.tableName}
        colName={colName}
        record={props.record}
      />}
    </For>
  )
}