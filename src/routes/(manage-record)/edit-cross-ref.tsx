import { Title } from "@solidjs/meta"
import { action, createAsync, json, useAction } from "@solidjs/router"
import { Component, For, Show, createSignal } from "solid-js"
import { H2, RecordPageTitle } from "~/components/PageTitle"
import { etv } from "~/client-only/util"
import { firstCap, humanCase } from "~/utils/string"
import { pluralTableName } from "~/utils/schema"
import { titleColumnName } from "~/utils/schema"
import { listCrossRecordsCache } from "~/client-only/query"
import { useSafeParams } from "~/client-only/util"
import { Link } from "~/components/Link"
import { Button } from "~/components/buttons"
import { getOneRecordById } from "~/api/getOne/recordById"
import { listRecords } from "~/api/list/records"
import { useBelongsTo } from "~/client-only/useBelongsTo"
import { deleteCrossRecord, whoCanDeleteCrossRecord } from "~/api/delete/crossRecord"
import { UserExplField } from "~/components/form/UserExplField"
import { CrossRecordMutateProps, insertCrossRecord } from "~/api/insert/crossRecord"
import { NestPanel } from "~/components/NestPanel"
import { DataRecordWithId } from "~/schema/type"

const insertCrossRecordAction = action(
  async (props: CrossRecordMutateProps) => {
    await insertCrossRecord(props)
    return json('ok', {
      revalidate: [
        listCrossRecordsCache.keyFor(
          props.b, props.a, props.a_id, props.first
        )
      ]
    })
  }
)

const deleteCrossRecordAction = action(
  async (props: CrossRecordMutateProps, userExpl: string) => {
    await deleteCrossRecord(props, userExpl)
    return json('ok', {
      revalidate: [
        listCrossRecordsCache.keyFor(
          props.b, props.a, props.a_id, props.first
        )
      ]
    })
  }
)

interface EditCrossRefParams {
  a: string
  b: string
  id: string
  first: string
}

const RecordSelect: Component<{
  selectedId: string
  setSelectedId: (id: string) => void
  records?: DataRecordWithId[]
  labelField: string
}> = props => {
  return (
    <select
      value={props.selectedId}
      onChange={etv(props.setSelectedId)}
    >
      <option value="">Select...</option>
      <For each={props.records}>
        {r => <option value={r.id}>{r[props.labelField]}</option>}
      </For>
    </select>
  )
}

export default function EditCrossRef() {
  const sp = useSafeParams<EditCrossRefParams>(['a', 'b', 'id', 'first'])
  const first = () => sp().first === 'true'
  const id = () => parseInt(sp().id)
  const [selectedAddId, setSelectedAddId] = createSignal<string>('')
  const [selectedRemoveId, setSelectedRemoveId] = createSignal<string>('')
  const [userExpl, setUserExpl] = createSignal('')

  const aRecord = createAsync(() => getOneRecordById(sp().a, id()))
  const linkedRecords = createAsync(() => listCrossRecordsCache(sp().b, sp().a, id(), first()))
  const allRrcords = createAsync(() => listRecords(sp().b))

  const linkedRecordIds = () => linkedRecords()?.map(lr => lr.id)
  const unlinkedRecords = () => allRrcords()?.filter(r => !linkedRecordIds()?.includes(r.id))

  const insertCrossRecordRun = useAction(insertCrossRecordAction)

  const onAdd = () => {
    if (!selectedAddId()) return;
    insertCrossRecordRun({
      a: sp().a,
      b: sp().b,
      first: first(),
      a_id: id(),
      b_id: parseInt(selectedAddId())
    })
  }

  const canDeleteCrossRecord = () => useBelongsTo(whoCanDeleteCrossRecord(
    first() ? sp().a : sp().b))
  const deleteCrossRecord = useAction(deleteCrossRecordAction)

  const onDelete = () => {
    if (!selectedRemoveId()) return
    const linkedId = parseInt(selectedRemoveId())
    const mutateProps = { a: sp().a, b: sp().b, first: first(), a_id: id(), b_id: linkedId }
    deleteCrossRecord(mutateProps, userExpl())
    setUserExpl('')
  }

  const bColName = titleColumnName(sp().b)
  const titleText = () => aRecord()?.[titleColumnName(sp().a)] as string | undefined

  return (
    <main>
      <Title>{titleText()}</Title>
      <RecordPageTitle tableName={sp().a} text={titleText() ?? ''} />
      <div class="px-2 pb-2">
        <div class="font-bold">{firstCap(pluralTableName(sp().b))}</div>
        <For each={linkedRecords()}>
          {lr => (
            <div>
              <Link
                route="show-record"
                params={{ tableName: sp().b, id: lr.id }}
                label={lr[bColName]}
              />
            </div>
          )}
        </For>
      </div>
      <NestPanel title={`Add ${humanCase(sp().b)}`} class="ml-2 mb-2">
        <RecordSelect
          selectedId={selectedAddId()}
          setSelectedId={setSelectedAddId}
          records={unlinkedRecords()}
          labelField={bColName}
        />
        <span class="inline-block w-2" />
        <Button
          label="Add"
          onClick={onAdd}
          tooltip="Add new record"
        />
      </NestPanel>
      <Show when={canDeleteCrossRecord()}>
        <NestPanel title={`Remove ${humanCase(sp().b)}`} class="ml-2 mb-2">
          <UserExplField value={userExpl()} onChange={setUserExpl} />
          <RecordSelect
            selectedId={selectedRemoveId()}
            setSelectedId={setSelectedRemoveId}
            records={linkedRecords()}
            labelField={bColName}
          />
          <span class="inline-block w-2" />
          <Button
            label="Remove"
            onClick={onDelete}
          />
        </NestPanel>
      </Show>
      <div class="px-2">
        <Link
          route="show-record"
          params={{ tableName: sp().a, id: sp().id }}
          type="button"
          label="Back"
        />
      </div>
    </main>
  )
}
