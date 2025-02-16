import { createAsync, useAction } from "@solidjs/router";
import { Component, For, Match, Show, Switch, useContext } from "solid-js";
import { schema } from "~/schema/schema";
import { AggregateSchema, DataRecord, ForeignKey, OneToNSchema } from "~/schema/type";
import {listCrossRecords, listRecords} from "~/api/shared/select";
import { titleColumnName } from "~/util";
import { crossList, simpleList, splitBoolean, splitFk } from "./aggregators";
import { SessionContext } from "~/SessionContext";
import {
  listForeignRecords,
  listOverlapRecords
} from "~/api/components/Aggregate";
import {listForeignHopRecordsCache} from "~/client-only/query";
import {deleteForeignHopRecordAction} from "~/client-only/action";
import { Link } from "~/components/Link";
import { Button } from "~/components/buttons";

export interface AggregateSection {
  title: string;
  records: () => DataRecord[] | undefined;
  link: { route: string, params: Record<string, any>, title: string }
}

const FkRecordListItem: Component<{
  tableName: string,
  aggregate: OneToNSchema,
  titleColumnName: string,
  titleColumn: ForeignKey,
  record: DataRecord,
  id: number
}> = props => {
  const deleteAction = useAction(deleteForeignHopRecordAction);
  const onDelete = () => deleteAction(
    props.aggregate.table, props.aggregate.column, props.id,
    props.titleColumnName, props.record.id as number
  )
  const { fk } = props.titleColumn
  const text = fk.getLabel?.(props.record) ?? props.record[fk.labelColumn]
  const sameTable = props.titleColumn.fk.table === props.tableName
  const hrefTableName = sameTable
    ? props.aggregate.table
    : props.titleColumn.fk.table
  const hrefId = sameTable
    ? props.id
    : props.record[props.titleColumnName]

  return (
    <>
      <Link
        route="show-record"
        params={{
          tableName: hrefTableName,
          id: hrefId
        }}
        label={text}
      />
      <Button
        label="X"
        onClick={onDelete}
        tooltip="Remove"
      />
    </>
  )
}

export const Aggregate: Component<{
  tableName: string;
  id: number;
  aggregateName: string;
}> = (props) => {
  const session = useContext(SessionContext)
  const aggregate = schema.tables[props.tableName].aggregates?.[props.aggregateName] as AggregateSchema

  const titleColName = () => titleColumnName(aggregate.table)
  const titleColumn = () => schema.tables[aggregate.table].columns[titleColName()]

  const records = createAsync(() => {
    if (aggregate.type === '1-n') {
      if (titleColumn().type === 'fk') {
        return listForeignHopRecordsCache(aggregate.table, aggregate.column, props.id, titleColName())
      } else {
        return listForeignRecords(aggregate.table, aggregate.column, props.id)
      }
    } else {
      return listCrossRecords(aggregate.table, props.tableName, props.id, !!aggregate.first)
    }
  })

  const aggregateTable = schema.tables[aggregate.table]

  const aggregatorProps = {
    tableName: props.tableName,
    id: props.id,
    aggregateTable,
    aggregate,
    records
  }

  let sections: () => AggregateSection[] = () => []
  if (aggregate.type === '1-n') {
    if (aggregate.splitByColumn) {
      const splitColumn = aggregateTable.columns[aggregate.splitByColumn]
      if (splitColumn.type === 'boolean') {
        sections = () => splitBoolean(aggregatorProps)
      } else if (splitColumn.type === 'fk') {
        const splitRecords = createAsync(() => {
          if (aggregate.filterSplitBy) {
            return listOverlapRecords(
              splitColumn.fk.table,
              aggregate.filterSplitBy,
              props.tableName,
              props.id
            )
          } else {
            return listRecords(splitColumn.fk.table)
          }
        })
        sections = () => splitFk({...aggregatorProps, splitRecords})
      }
    } else {
      sections = () => simpleList(aggregatorProps)
    }
  } else {
    sections = () => crossList(aggregatorProps)
  }

  return (
    <For each={sections()}>
      {section => (
        <section class="pb-2">
          <div>
            <span class="px-2 font-bold">{section.title}</span>
            <Show when={session?.userSession()?.authenticated}>
              <Link
                route={section.link.route}
                params={section.link.params}
                type="button"
                label={section.link.title}
                tooltip="add / remove"
              />
            </Show>
          </div>
          <For each={section.records()}>{(record) => (
            <div class="px-2">
              <Switch>
                <Match when={titleColumn().type === 'fk'}>
                  <FkRecordListItem
                    tableName={props.tableName}
                    aggregate={aggregate as OneToNSchema}
                    titleColumnName={titleColName()}
                    titleColumn={titleColumn() as ForeignKey}
                    record={record}
                    id={props.id}
                  />
                </Match>
                <Match when>
                  <Link
                    route="show-record"
                    params={{
                      tableName: aggregate.table,
                      id: record.id
                    }}
                    label={aggregateTable.preview?.(record) ?? record[titleColName()]}
                  />
                </Match>
              </Switch>
            </div>
          )}</For>
        </section>
      )}
    </For>
  )
}

