import { Component } from "solid-js"
import { schema } from "~/schema/schema"
import { ForeignKey } from "~/schema/type"
import { humanCase } from "~/util"

export const ColumnLabel: Component<{
  tableName: string
  colName: string
  label?: string
}> = (props) => {
  const column = () => schema.tables[props.tableName].columns[props.colName]
  const labelText = props.label
    ?? column().label
    ?? (column().type === 'fk' ? (column() as ForeignKey).fk.table : undefined)
    ?? props.colName

  return (
    <div class="font-bold first-letter:uppercase" >
      {humanCase(labelText)}
    </div>
  )
}
