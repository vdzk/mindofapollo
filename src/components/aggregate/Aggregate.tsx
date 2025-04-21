import { createAsync, query } from "@solidjs/router"
import { Component, createMemo, For } from "solid-js"
import { schema } from "~/schema/schema"
import { AggregateSchema } from "~/schema/type"
import { titleColumnName } from "~/utils/schema"
import { crossList, simpleList, splitBoolean, splitFk } from "./aggregators"
import { listForeignHopRecordsCache } from "~/client-only/query"
import { listForeignRecords } from "~/api/list/foreignRecords"
import { listCrossRecords } from "~/api/list/crossRecords"
import { listOverlapRecords } from "~/api/list/overlapRecords"
import { listRecords } from "~/api/list/records"
import { AggregateSection } from "./AggregateSection"

const getAggregateRecords = (
  tableName: string,
  id: number,
  aggregateName: string
) => {
  const aggregate = schema.tables[tableName].aggregates?.[aggregateName] as AggregateSchema
  const titleColName = titleColumnName(aggregate.table)
  const titleColumn = () => schema.tables[aggregate.table].columns[titleColName]
  if (aggregate.type === '1-n') {
    if (titleColumn().type === 'fk') {
      return listForeignHopRecordsCache(aggregate.table, aggregate.column, id, titleColName)
    } else {
      return listForeignRecords(aggregate.table, aggregate.column, id)
    }
  } else {
    return listCrossRecords(aggregate.table, tableName, id, !!aggregate.first)
  }
}

export const getAggregateRecordsCache = query(getAggregateRecords, 'getAggregateRecords')

export const Aggregate: Component<{
  tableName: string;
  id: number;
  aggregateName: string;
}> = (props) => {
  const _aggregate = () => schema.tables[props.tableName].aggregates?.[props.aggregateName] as AggregateSchema

  const records = createAsync(() => getAggregateRecordsCache(props.tableName, props.id, props.aggregateName))

  const splitRecords = createAsync(async () => {
    const aggregate = _aggregate()
    const aggregateTable = schema.tables[aggregate.table]
    if (aggregate.type === '1-n' && aggregate.splitByColumn) {
      const splitColumn = aggregateTable.columns[aggregate.splitByColumn]
      if (splitColumn.type === 'fk') {
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
      }
    }
  })

  const sections = createMemo(() => {
    const aggregate = _aggregate()
    const aggregateTable = schema.tables[aggregate.table]

    const aggregatorProps = {
      tableName: props.tableName,
      id: props.id,
      aggregateTable,
      aggregate,
      records: records()
    }

    let sections
    if (aggregate.type === '1-n') {
      if (aggregate.splitByColumn) {
        const splitColumn = aggregateTable.columns[aggregate.splitByColumn]
        if (splitColumn.type === 'boolean') {
          sections = splitBoolean(aggregatorProps)
        } else if (splitColumn.type === 'fk') {
          sections = splitFk({ ...aggregatorProps, splitRecords: splitRecords() })
        }
      } else {
        sections = simpleList(aggregatorProps)
      }
    } else {
      sections = crossList(aggregatorProps)
    }
    if (sections && aggregate.type === '1-n' && aggregate.hideEmptySections) {
      sections = sections.filter(section => section.records?.length)
    }
    return sections
  })

  return (
    <For each={sections()}>
      {section => (
        <AggregateSection
          tableName={props.tableName}
          id={props.id}
          aggregateName={props.aggregateName}
          aggregate={_aggregate()}
          section={section}
        />
      )}
    </For>
  )
}

