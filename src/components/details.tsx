import { Component } from "solid-js"
import { DataRecord } from "~/schema/type"
import { ColumnLabel } from "./ColumnLabel"
import { DisplayValue } from "./DislayValue"
import { ExplDiff } from "./expl/types"

export interface DetailProps {
  tableName: string
  colName: string
  label?: string
  record: DataRecord
  showExplLink?: boolean
}

export const Detail: Component<DetailProps> = props => {
  return (
    <div class="px-2 pb-2">
      <ColumnLabel {...props} />
      <DisplayValue {...props} />
    </div>
  )
}

export const DetailDiff: Component<{
  tableName: string
  colName: string
  diff: ExplDiff<any>
}> = props => {
  return (
    <div class="px-2 pb-2">
      <ColumnLabel {...props} />
      <DisplayValue {...props} record={props.diff.before} />
      {' → '}
      <DisplayValue {...props} record={props.diff.after} />
    </div>
  )
}
