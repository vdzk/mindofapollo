import { action, json, useAction } from "@solidjs/router"
import { Component, createSignal, Show } from "solid-js"
import { deleteById, whoCanDeleteById } from "~/api/delete/byId"
import { useBelongsTo } from "~/client-only/useBelongsTo"
import { useOfSelf } from "~/client-only/useOfSelf"
import { OneToNSchema, ForeignKey, DataRecordWithId } from "~/schema/type"
import { Button } from "../buttons"
import { Link } from "../Link"
import { listForeignHopRecordsCache } from "~/client-only/query"
import { NestPanel } from "../NestPanel"
import { UserExplField } from "../form/UserExplField"

const deleteAction = action(async (
  tableName: string,
  fkName: string,
  fkId: number,
  hopColName: string,
  deleteId: number,
  userExpl: string
) => {
  await deleteById(tableName, deleteId, userExpl)
  return json( 'ok', {
      revalidate: [
        listForeignHopRecordsCache.keyFor(tableName, fkName, fkId, hopColName)
      ]
    }
  )
})

export const FkRecordListItem: Component<{
  tableName: string;
  aggregate: OneToNSchema;
  titleColumnName: string;
  titleColumn: ForeignKey;
  record: DataRecordWithId;
  id: number;
}> = props => {
  const [showDelete, setShowDelete] = createSignal(false)
  const [userExpl, setUserExpl] = createSignal('')
  const canDeleteById = () => useBelongsTo(whoCanDeleteById(
    props.aggregate.table,
    useOfSelf(props.aggregate.table, props.record)
  ));
  const _delete = useAction(deleteAction);
  const onDelete = () => _delete(
    props.aggregate.table, props.aggregate.column, props.id,
    props.titleColumnName, props.record.id, userExpl()
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
        label={text}
      />
      <span class="mr-2"/>
      <Show when={canDeleteById() && !showDelete()}>
        <Button
          label="X"
          onClick={() => setShowDelete(true)}
          tooltip="Remove" />
      </Show>
      <Show when={showDelete()}>
        <NestPanel title="Remove">
          <UserExplField value={userExpl()} onChange={setUserExpl} />
          <div class="flex gap-2">
            <Button
              label="Cancel"
              onClick={() => setShowDelete(false)}
            />
            <Button
              label="Remove"
              onClick={onDelete}
            />
          </div>
        </NestPanel>
      </Show>
    </>
  );
};
