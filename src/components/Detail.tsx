import { Component, Match, Switch } from "solid-js";
import { BooleanColumn, ColumnSchema, DataLiteral, DataRecord, ForeignKey } from "~/schema/type";
import { ColumnLabel } from "./ColumnLabel";
import { createAsync } from "@solidjs/router";
import { getRecordById } from "~/api/shared/select";
import { nbsp } from "~/util";
import { schema } from "~/schema/schema";
import { getOriginTypes } from "~/api/shared/valueType";

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

  const originTypes = createAsync(async () => {
    if (column().type === 'value_type_id') {
      return getOriginTypes(props.tableName, props.colName)
    }
  })
  const columnType = () => {
    const col = column()
    if (col.type === 'value_type_id') {
      props.record[col.typeOriginColumn]
      const typeOriginId = props.record[col.typeOriginColumn]
      if (originTypes() && typeOriginId) {
        return originTypes()![typeOriginId as number]
      }
    } else {
      return col.type
    }
  }

  return (
    <div class="px-2 pb-2">
      <ColumnLabel {...props} column={column()} />
      <Switch>
        <Match when={columnType() === 'fk'}>
          <FkValue
            column={column() as ForeignKey}
            id={value() as number}
          />
        </Match>
        <Match when={columnType() === 'boolean'}>
          <Switch>
            <Match when={(column() as BooleanColumn).optionLabels}>
              <div>
                {(column() as BooleanColumn).optionLabels?.[value() ? 1 : 0]}
              </div>
            </Match>
            <Match when>
              {value() ? 'true' : 'false'}
            </Match>
          </Switch>
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
