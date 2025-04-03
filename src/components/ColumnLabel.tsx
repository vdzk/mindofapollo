import { Component } from "solid-js"
import { schema } from "~/schema/schema"
import { humanCase } from "~/utils/string"

export const ColumnLabel: Component<{
  tableName: string
  colName: string
  label?: string
  suffix?: string
}> = (props) => {
  const labelText = () => {
    const table = schema.tables[props.tableName]
    if (props.label) return props.label
    if (props.colName === 'id') {
      if (table.extendsTable) {
        return humanCase(table.extendsTable)
      } else {
        return 'ID'
      }
    }
    const column = table.columns[props.colName]
    if (!column) return props.colName
    if (column.label) return column.label
    if (column.type === 'fk') return column.fk.table
    return props.colName
  }

  return (
    <div class="font-bold first-letter:uppercase" >
      {humanCase(labelText())}{props.suffix}
    </div>
  )
}
