import { AggregateSchema, BooleanColumn, DataRecord, ForeignKey, NToNSchema, OneToNSchema, TableSchema } from "~/schema/type";
import { firstCap, pluralTableName, titleColumnName } from "~/util";
import { AggregateSection } from "./Aggregate";

export type Aggregator = (props: {
  tableName: string
  id: string
  aggregateTable: TableSchema
  aggregate: AggregateSchema
  records: () => DataRecord[] | undefined,
  splitRecords?: () => DataRecord[] | undefined,
}) => AggregateSection[]

export const simpleList: Aggregator = (props) => [{
  title: firstCap(pluralTableName(props.aggregate.table)),
  records: props.records,
  link: {
    title: '[ + ]',
    href: `/create-record`
    + `?tableName=${props.aggregate.table}`
    + `&sourceTable=${props.tableName}`
    + `&sourceId=${props.id}`
    + `&${(props.aggregate as OneToNSchema).column}=${props.id}`
  }
}]

export const crossList: Aggregator = (props) => [{
  title: firstCap(pluralTableName(props.aggregate.table)),
  records: props.records,
  link: {
    title: '[ +/− ]',
    href: `/edit-cross-ref`
    + `?a=${props.tableName}`
    + `&b=${props.aggregate.table}`
    + `&id=${props.id}`
    + `&first=${(props.aggregate as NToNSchema).first || ''}`
  }
}]

export const splitBoolean: Aggregator = (props) => {
  const splitColumnName = (props.aggregate as OneToNSchema).splitByColumn as string
  const splitColumn = props.aggregateTable.columns[splitColumnName] as BooleanColumn
  // Assumes optionLabels
  const result = []
  for (const value of [true, false]) {
    const label = splitColumn.optionLabels?.[value ? 1 : 0]
    result.push({
      title: label + ' ' + props.aggregateTable.plural,
      records: () => props.records()
        ?.filter(r => r[splitColumnName] === value),
      link: {
        title: '[ + ]',
        href: `/create-record`
        + `?tableName=${props.aggregate.table}`
        + `&sourceTable=${props.tableName}`
        + `&sourceId=${props.id}`
        + `&${(props.aggregate as OneToNSchema).column}=${props.id}`
        + `&${splitColumnName}=${value + ''}`
      }
    })
  }
  return result
}

export const splitFk: Aggregator = (props) => {
  const splitColumnName = (props.aggregate as OneToNSchema).splitByColumn as string
  const splitColumn = props.aggregateTable.columns[splitColumnName] as ForeignKey
  const splitTitleColumnName = titleColumnName(splitColumn.fk.table)

  return (props.splitRecords?.() ?? []).map(record => ({
    title: record[splitTitleColumnName] as string,
    records: () => props.records()
      ?.filter(r => r[splitColumnName] === record.id),
    link: {
      title: '[ + ]',
      href: `/create-record`
      + `?tableName=${props.aggregate.table}`
      + `&sourceTable=${props.tableName}`
      + `&sourceId=${props.id}`
      + `&${(props.aggregate as OneToNSchema).column}=${props.id}`
      + `&${splitColumnName}=${record.id}`
    }
  }))
}
