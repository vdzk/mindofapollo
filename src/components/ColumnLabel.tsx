import { Component } from "solid-js"
import { ColumnSchema } from "~/schema/type"
import { humanCase } from "~/util"

export const ColumnLabel: Component<{
  colName: string,
  column: ColumnSchema,
  label?: string
}> = (props) => {
  const labelText = props.label
    ?? props.column.label
    ?? (props.column.type === 'fk' ? props.column.fk.table : undefined)
    ?? props.colName

  return (
    <div class="font-bold first-letter:uppercase" >
      {humanCase(labelText)}
    </div>
  )
}
