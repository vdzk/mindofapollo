import { Component, Match, Switch } from "solid-js";
import { BooleanColumn, ColumnSchema, DataLiteral, DataRecord, ForeignKey } from "~/schema/type";
import { ColumnLabel } from "./ColumnLabel";
import { createAsync } from "@solidjs/router";
import { getRecordById } from "~/server/select.db";
import { nbsp } from "~/util";
import { schema } from "~/schema/schema";

const FkValue: Component<{
  column: ForeignKey,
  id: number
}> = (props) => {
  const tableName = props.column.fk.table
  const record = createAsync(() => {
    if (props.id === undefined) {
      // TODO: figure out why this happens
      return Promise.resolve(undefined)
    } else {
      return getRecordById(tableName, props.id)
    }
  })

  return (
    <div>
      <a
        class="hover:underline"
        href={`/show-record?tableName=${tableName}&id=${props.id}`}
      >
        {record?.()?.[props.column.fk.labelColumn] ?? nbsp}
      </a>
    </div>
  )
}

export interface DetailProps {
  tableName: string
  colName: string
  label?: string
  record: DataRecord
}

export const Detail: Component<DetailProps> = props => {
  const column = () => schema.tables[props.tableName].columns[props.colName]
  const value = () => props.record[props.colName]
  return (
    <div class="px-2 pb-2">
      <ColumnLabel {...props} column={column()} />
      <Switch>
        <Match when={column().type === 'fk'}>
          <FkValue
            column={column() as ForeignKey}
            id={value() as number}
          />
        </Match>
        <Match when={
          column().type === 'boolean'
          && (column() as BooleanColumn).optionLabels
        }>
          <div>
            {(column() as BooleanColumn).optionLabels?.[value() ? 1 : 0]}
          </div>
        </Match>
        <Match when>
          <div class="whitespace-pre-line">
            {value() || nbsp}
          </div>
        </Match>
      </Switch>
    </div>
  )
}