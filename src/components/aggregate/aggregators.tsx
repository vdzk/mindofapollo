import { AggregateSchema, BooleanColumn, DataRecord, DataRecordWithId, ForeignKey, NToNSchema, OneToNSchema, TableSchema } from "~/schema/type"
import { firstCap } from "~/utils/string"
import { pluralTableName } from "~/utils/schema"
import { titleColumnName } from "~/utils/schema"
import { AggregateSectionSettings } from "./AggregateSection"
import { Link } from "../Link"

export type Aggregator = (props: {
  tableName: string
  id: number
  aggregateTable: TableSchema
  aggregate: AggregateSchema
  records: () => DataRecordWithId[] | undefined,
  splitRecords?: () => DataRecord[] | undefined,
}) => AggregateSectionSettings[]

export const simpleList: Aggregator = (props) => [{
  title: firstCap(pluralTableName(props.aggregate.table)),
  records: props.records
}]

export const crossList: Aggregator = (props) => [{
  title: firstCap(pluralTableName(props.aggregate.table)),
  records: props.records,
  controls: (
    <Link
      type="button"
      label="+/−"
      tooltip="add / remove"
      route="edit-cross-ref"
      params={{
        a: props.tableName,
        b: props.aggregate.table,
        id: props.id,
        first: (props.aggregate as NToNSchema).first || ''
      }}
    />
  )
}]

export const splitBoolean: Aggregator = (props) => {
  const aggregateOneToN = props.aggregate as OneToNSchema
  const splitColumnName = aggregateOneToN.splitByColumn as string
  const splitColumn = props.aggregateTable.columns[splitColumnName] as BooleanColumn
  // Assumes optionLabels
  const result = []
  for (const value of [true, false]) {
    const label = splitColumn.optionLabels?.[value ? 1 : 0]
    result.push({
      title: label + ' ' + props.aggregateTable.plural,
      records: () => props.records()
        ?.filter(r => r[splitColumnName] === value)
    })
  }
  return result
}

export const splitFk: Aggregator = (props) => {
  const aggregateOneToN = props.aggregate as OneToNSchema
  const splitColumnName = aggregateOneToN.splitByColumn as string
  const splitColumn = props.aggregateTable.columns[splitColumnName] as ForeignKey
  const splitTitleColumnName = titleColumnName(splitColumn.fk.table)

  return (props.splitRecords?.() ?? []).map(record => ({
    title: record[splitTitleColumnName] as string,
    records: () => props.records()
      ?.filter(r => r[splitColumnName] === record.id),
    splitById: record.id as number
  }))
}
