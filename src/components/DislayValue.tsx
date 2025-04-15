import { Component, Match, Show, Suspense, Switch } from "solid-js"
import { BooleanColumn, DataRecord, ForeignKey, SimpleColumn } from "~/schema/type"
import { createAsync } from "@solidjs/router"
import { getPercent } from "~/utils/string"
import { nbsp } from "~/utils/string"
import { schema } from "~/schema/schema"
import { ExplLink } from "./expl/ExplLink"
import { ExternalLink, Link } from "./Link";
import { getOneRecordById } from "~/api/getOne/recordById"
import { listOriginTypes } from "~/api/list/originTypes"
import { isPersonal } from "~/permissions"
import { FkDetails } from "./FkDetails"

const FkValue: Component<{
  column: ForeignKey,
  id: number
}> = (props) => {
  const tableName = props.column.fk.table
  const record = createAsync(() => getOneRecordById(tableName, props.id))

  return (
    <Suspense fallback={nbsp}>
      <Link
        route="show-record"
        params={{
          tableName: tableName,
          id: props.id
        }}
        label={record?.()?.[props.column.fk.labelColumn] ?? `(ID: ${props.id})`}
      />
    </Suspense>
  )
}

export interface DisplayValue {
  tableName: string
  colName: string
  label?: string
  record: DataRecord
  showExplLink?: boolean
}

export const DisplayValue: Component<DisplayValue> = props => {
  const column = () => props.colName === 'id'
    ? { type: 'integer' } as SimpleColumn
    : schema.tables[props.tableName].columns[props.colName]
  const value = () => props.record[props.colName]

  const originTypes = createAsync(async () => {
    if (column().type === 'value_type_id') {
      return listOriginTypes(props.tableName, props.colName)
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

  const explId = () => props.record[props.colName + '_expl_id']

  return (
    <>
      <Switch>
        <Match when={columnType() === 'fk'}>
          <Show when={value()} fallback={nbsp}>
            <FkValue
              column={column() as ForeignKey}
              id={value() as number}
            />
          </Show>
        </Match>
        <Match when={columnType() === 'boolean'}>
          <Switch>
            <Match when={(column() as BooleanColumn).optionLabels}>
              {(column() as BooleanColumn).optionLabels?.[value() ? 1 : 0]}
            </Match>
            <Match when>
              {value() ? 'true' : 'false'}
            </Match>
          </Switch>
        </Match>
        <Match when={columnType() === 'proportion'}>
          {value() ? getPercent(value() as number) : nbsp}
        </Match>
        <Match when={columnType() === 'link_url'}>
          <ExternalLink href={value() as string} />
        </Match>
        <Match when>
          <span class="whitespace-pre-line">
            <Switch>
              <Match when={value() === ''}>
                {nbsp}
              </Match>
              <Match when>
                {value() ?? nbsp}
              </Match>
            </Switch>
          </span>
        </Match>
      </Switch>
      <Show when={explId() && !isPersonal(props.tableName) && props.showExplLink !== false}>
        {' '}
        <ExplLink explId={explId() as number} />
      </Show>
      <Show when={columnType() === 'fk' && value()}>
        <span class="inline-block w-1" />
        <FkDetails
          fk={(column() as ForeignKey).fk}
          fkId={value() as number}
        />
      </Show>
    </>
  )
}
