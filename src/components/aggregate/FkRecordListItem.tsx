import { Component } from "solid-js"
import { OneToNSchema, ForeignKey, DataRecordWithId } from "~/schema/type"
import { RemovableListItem } from "./RemovableListItem"

export const FkRecordListItem: Component<{
  tableName: string;
  aggregateName: string;
  aggregate: OneToNSchema;
  titleColumnName: string;
  titleColumn: ForeignKey;
  item: DataRecordWithId;
  recordId: number;
}> = props => {
  const { fk } = props.titleColumn;
  const text = () => fk.getLabel?.(props.item) ?? props.item[fk.labelColumn] as string
  const sameTable = () => props.titleColumn.fk.table === props.tableName;
  const hrefTableName = () => sameTable()
    ? props.aggregate.table
    : props.titleColumn.fk.table;
  const hrefId = () => sameTable()
    ? props.recordId
    : props.item[props.titleColumnName];

  return (
    <RemovableListItem
      tableName={props.tableName}
      recordId={props.recordId}
      aggregateName={props.aggregateName}
      itemTable={props.aggregate.table}
      item={props.item}
      text={text()}
      linkRoute="show-record"
      linkParams={{
        tableName: hrefTableName(),
        id: hrefId()
      }}
    />
  );
};
