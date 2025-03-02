import { Component } from "solid-js"
import { schema } from "~/schema/schema"
import { humanCase } from "~/util"

export const ColumnLabel: Component<{
  tableName: string
  colName: string
  label?: string
}> = (props) => {
  const labelText = () => {
    if (props.label) return props.label
    if (props.colName === 'id') return 'ID'
    const column = schema.tables[props.tableName].columns[props.colName]
    if (!column) return props.colName
    if (column.label) return column.label
    if (column.type === 'fk') return column.fk.table
    return props.colName
  }

  return (
    <div class="font-bold first-letter:uppercase" >
      {humanCase(labelText())}
    </div>
  )
}
