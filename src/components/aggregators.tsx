import { AggregateSchema, BooleanColumn, DataRecord, DataRecordWithId, ForeignKey, NToNSchema, OneToNSchema, TableSchema } from "~/schema/type";
import { firstCap } from "~/utils/string";
import { pluralTableName } from "~/utils/schema";
import { titleColumnName } from "~/utils/schema";
import { AggregateSection } from "./Aggregate"

export type Aggregator = (props: {
  tableName: string
  id: number
  aggregateTable: TableSchema
  aggregate: AggregateSchema
  records: () => DataRecordWithId[] | undefined,
  splitRecords?: () => DataRecord[] | undefined,
}) => AggregateSection[]

export const simpleList: Aggregator = (props) => [{
  title: firstCap(pluralTableName(props.aggregate.table)),
  records: props.records,
  link: {
    title: '+',
    route: 'create-record',
    params: {
      tableName: props.aggregate.table,
      sourceTable: props.tableName,
      sourceId: props.id,
      ...((props.aggregate as OneToNSchema).column ? {
        [(props.aggregate as OneToNSchema).column]: props.id
      } : {})
    }
  }
}]

export const crossList: Aggregator = (props) => [{
  title: firstCap(pluralTableName(props.aggregate.table)),
  records: props.records,
  link: {
    title: '+/−',
    route: 'edit-cross-ref',
    params: {
      a: props.tableName,
      b: props.aggregate.table,
      id: props.id,
      first: (props.aggregate as NToNSchema).first || ''
    }
  }
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
        ?.filter(r => r[splitColumnName] === value),
      link: {
        title: '+',
        route: 'create-record',
        params: {
          tableName: props.aggregate.table,
          sourceTable: props.tableName,
          sourceId: props.id,
          [aggregateOneToN.column]: props.id,
          [splitColumnName]: value
        }
      }
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
    link: {
      title: '+',
      route: 'create-record',
      params: {
        tableName: props.aggregate.table,
        sourceTable: props.tableName,
        sourceId: props.id,
        [aggregateOneToN.column]: props.id,
        [splitColumnName]: record.id
      }
    }
  }))
}
