import { createAsync, revalidate } from "@solidjs/router"
import { Component, createMemo, createSignal, For, Show } from "solid-js"
import { NToNSchema } from "~/schema/type"
import { firstCap, humanCase } from "~/utils/string"
import { NestPanel } from "../NestPanel"
import { RecordSelect } from "~/components/form/RecordSelect"
import { Button } from "../buttons"
import { titleColumnName } from "~/utils/schema"
import { CreateNew } from "./CreateNew"
import { listRecordsCache } from "~/client-only/query"
import { useBelongsTo } from "~/client-only/useBelongsTo"
import { whoCanInsertRecord } from "~/api/insert/record"

export const CrossRef: Component<{
  tableName: string,
  aggregateName: string,
  aggregate: NToNSchema,
  linkedRecordIds: number[],
  setLinkedRecordIds: (setIds: (curIds: number[]) => number[]) => void
}> = (props) => {
  const allRecords = createAsync(() => listRecordsCache(props.aggregate.table))
  const [selectedAddId, setSelectedAddId] = createSignal('')
  const unlinkedRecords = () => allRecords()?.filter(
    r => !props.linkedRecordIds.includes(r.id)
  )
  const labelField = createMemo(() => titleColumnName(props.aggregate.table))
  const labels = createMemo(() => Object.fromEntries(
    allRecords()?.map(r => [r.id, r[labelField()]]
  ) || []))
  const canCreateNew = () => useBelongsTo(whoCanInsertRecord(props.aggregate.table))

  const onAdd = () => props.setLinkedRecordIds(x => [...x, parseInt(selectedAddId())])
  const onRemove = (id: number) => props.setLinkedRecordIds(x => x.filter(xId => xId !== id))
  const onFormExit = async (savedId?: number) => {
    if (savedId) {
      await revalidate(listRecordsCache.keyFor(props.aggregate.table))
      props.setLinkedRecordIds(x => [...x, savedId])
    }
  }

  return (
    <>
      <div class="font-bold">{firstCap(humanCase(props.aggregateName))}</div>
      <For each={props.linkedRecordIds}>
        {id => (
          <div>
            {labels()[id]}
            <Button
              label="X"
              class="ml-2 text-sm"
              onClick={() => onRemove(id)}
              tooltip="Remove"
            />
          </div>
        )}
      </For>
      <NestPanel
        title={`Add ${humanCase(props.aggregate.table)}`}
        class="mt-1 mb-2"
      >
        <Show when={canCreateNew()}>
          <CreateNew
            tableName={props.aggregate.table}
            onFormExit={onFormExit}
            formDepth={1}
          />
        </Show>
        <RecordSelect
          selectedId={selectedAddId()}
          setSelectedId={setSelectedAddId}
          records={unlinkedRecords()}
          labelField={labelField()}
          canCreateNew={canCreateNew()}
        />
        <span class="inline-block w-2" />
        <Button
          label="Add"
          onClick={onAdd}
        />
      </NestPanel>
    </>
  )
}