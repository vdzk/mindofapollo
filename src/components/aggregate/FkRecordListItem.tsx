import { useAction } from "@solidjs/router"
import { Component, Show } from "solid-js"
import { whoCanDeleteById } from "~/api/delete/byId"
import { deleteForeignHopRecordAction } from "~/client-only/action"
import { useBelongsTo } from "~/client-only/useBelongsTo"
import { useOfSelf } from "~/client-only/useOfSelf"
import { OneToNSchema, ForeignKey, DataRecordWithId } from "~/schema/type"
import { Button } from "../buttons"
import { Link } from "../Link"

export const FkRecordListItem: Component<{
  tableName: string;
  aggregate: OneToNSchema;
  titleColumnName: string;
  titleColumn: ForeignKey;
  record: DataRecordWithId;
  id: number;
}> = props => {
  const canDeleteById = () => useBelongsTo(whoCanDeleteById(
    props.aggregate.table,
    useOfSelf(props.aggregate.table, props.record)
  ));
  const deleteAction = useAction(deleteForeignHopRecordAction);
  const onDelete = () => deleteAction(
    props.aggregate.table, props.aggregate.column, props.id,
    props.titleColumnName, props.record.id
  );
  const { fk } = props.titleColumn;
  const text = fk.getLabel?.(props.record) ?? props.record[fk.labelColumn];
  const sameTable = props.titleColumn.fk.table === props.tableName;
  const hrefTableName = sameTable
    ? props.aggregate.table
    : props.titleColumn.fk.table;
  const hrefId = sameTable
    ? props.id
    : props.record[props.titleColumnName];

  return (
    <>
      <Link
        route="show-record"
        params={{
          tableName: hrefTableName,
          id: hrefId
        }}
        label={text} />
      <Show when={canDeleteById()}>
        <Button
          label="X"
          onClick={onDelete}
          tooltip="Remove" />
      </Show>
    </>
  );
};
