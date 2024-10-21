import { createAsync } from "@solidjs/router";
import postgres from "postgres";
import { AggregateSchema, BooleanColumn, ForeignKey, NToNSchema, OneToNSchema, TableSchema } from "~/schema.type";
import { firstCap, humanCase, titleColumnName } from "~/util";
import { AggregateSection } from "./Aggregate";

export type Aggregator = (props: {
  tableName: string
  id: string
  aggregateTable: TableSchema
  aggregate: AggregateSchema
  records: () => postgres.RowList<postgres.Row[]> | undefined,
  splitRecords?: () => postgres.RowList<postgres.Row[]> | undefined
}) => AggregateSection[]

export const simpleList: Aggregator = (props) => [{
  title: firstCap(props.aggregateTable.plural),
  records: props.records,
  button: <a
    class="mx-2 text-sky-800"
    href={`/create-record`
      + `?tableName=${props.aggregate.table}`
      + `&sourceTable=${props.tableName}`
      + `&sourceId=${props.id}`
      + `&${(props.aggregate as OneToNSchema).column}=${props.id}`
    }
  >[ + Add {humanCase(props.aggregate.table)} ]</a>
}]

export const crossList: Aggregator = (props) => [{
  title: firstCap(props.aggregateTable.plural),
  records: props.records,
  button: <a
    class="mx-2 text-sky-800"
    href={`/edit-cross-ref`
      + `?a=${props.tableName}`
      + `&b=${props.aggregate.table}`
      + `&id=${props.id}`
      + `&first=${(props.aggregate as NToNSchema).first || ''}`
    }>[ Edit {humanCase(props.aggregateTable.plural)} ]</a>
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
      button: <a
        class="mx-2 text-sky-800"
        href={`/create-record`
          + `?tableName=${props.aggregate.table}`
          + `&sourceTable=${props.tableName}`
          + `&sourceId=${props.id}`
          + `&${(props.aggregate as OneToNSchema).column}=${props.id}`
          + `&${splitColumnName}=${value + ''}`
        }
      >[ + Add {label?.toLocaleLowerCase()} {humanCase(props.aggregate.table)} ]</a>
    })
  }
  return result
}

export const splitFk: Aggregator = (props) => {
  const splitColumnName = (props.aggregate as OneToNSchema).splitByColumn as string
  const splitColumn = props.aggregateTable.columns[splitColumnName] as ForeignKey
  const splitTitleColumnName = titleColumnName(splitColumn.fk.table)
  return (props.splitRecords?.() ?? []).map(record => ({
    title: record[splitTitleColumnName],
    records: () => props.records()
      ?.filter(r => r[splitColumnName] === record.id),
    button: <a
    class="mx-2 text-sky-800"
    href={`/create-record`
      + `?tableName=${props.aggregate.table}`
      + `&sourceTable=${props.tableName}`
      + `&sourceId=${props.id}`
      + `&${(props.aggregate as OneToNSchema).column}=${props.id}`
      + `&${splitColumnName}=${record.id}`
    }
  >[ + Add {humanCase(props.aggregate.table)} ]</a>
  }))
}