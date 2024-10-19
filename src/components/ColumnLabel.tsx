import { Component } from "solid-js"
import { ColumnSchema } from "~/schema"
import { humanCase } from "~/util"

export const ColumnLabel: Component<{
  colName: string,
  column: ColumnSchema
}> = (props) => {
  let labelText = props.colName
  if (props.column.label) {
    labelText = props.column.label
  } else if (props.column.type === 'fk') {
    labelText = props.column.fk.table
  }
  return (
    <div class="font-bold first-letter:uppercase" >
      {humanCase(labelText)}
    </div>
  )
}