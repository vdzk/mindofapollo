import { Title } from "@solidjs/meta"
import { action, createAsync, json, revalidate, useAction } from "@solidjs/router"
import { For, Show, createSignal } from "solid-js"
import { RecordPageTitle } from "~/components/PageTitle"
import { firstCap, humanCase } from "~/utils/string"
import { pluralTableName } from "~/utils/schema"
import { titleColumnName } from "~/utils/schema"
import { listCrossRecordsCache, listRecordsCache } from "~/client-only/query"
import { useSafeParams } from "~/client-only/util"
import { Link } from "~/components/Link"
import { Button } from "~/components/buttons"
import { getOneRecordById } from "~/api/getOne/recordById"
import { useBelongsTo } from "~/client-only/useBelongsTo"
import { deleteCrossRecord, whoCanDeleteCrossRecord } from "~/api/delete/crossRecord"
import { UserExplField } from "~/components/form/UserExplField"
import { CrossRecordMutateProps, insertCrossRecord } from "~/api/insert/crossRecord"
import { NestPanel } from "~/components/NestPanel"
import { RecordSelect } from "../../components/form/RecordSelect"
import { CreateNew } from "~/components/form/CreateNew"
import { whoCanInsertRecord } from "~/api/insert/record"

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

export default function EditCrossRef() {
  const sp = useSafeParams<EditCrossRefParams>(['a', 'b', 'id', 'first'])
  const first = () => sp().first === 'true'
  const id = () => parseInt(sp().id)
  const [selectedAddId, setSelectedAddId] = createSignal<string>('')
  const [selectedRemoveId, setSelectedRemoveId] = createSignal<string>('')
  const [userExpl, setUserExpl] = createSignal('')

  const aRecord = createAsync(() => getOneRecordById(sp().a, id()))
  const linkedRecords = createAsync(() => listCrossRecordsCache(sp().b, sp().a, id(), first()))
  const allRecords = createAsync(() => listRecordsCache(sp().b))

  const linkedRecordIds = () => linkedRecords()?.map(lr => lr.id)
  const unlinkedRecords = () => allRecords()?.filter(r => !linkedRecordIds()?.includes(r.id))

  const insertCrossRecordRun = useAction(insertCrossRecordAction)

  const getInsertParams = (b_id: number) => ({
    a: sp().a, b: sp().b,
    first: first(),
    a_id: id(), b_id
  })

  const canCreateNew = () => useBelongsTo(whoCanInsertRecord(sp().b))
  const onFormExit = async (savedId?: number) => {
    if (savedId) {
      await revalidate([listRecordsCache.keyFor(sp().b)])
      await insertCrossRecordRun(getInsertParams(savedId))
    }
  }

  const onAdd = () => {
    if (!selectedAddId()) return;
    insertCrossRecordRun(getInsertParams(parseInt(selectedAddId())))
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
        <Show when={canCreateNew()}>
          <CreateNew
            tableName={sp().b}
            onFormExit={onFormExit}
            formDepth={1}
          />
        </Show>
        <RecordSelect
          selectedId={selectedAddId()}
          setSelectedId={setSelectedAddId}
          records={unlinkedRecords()}
          labelField={bColName}
          canCreateNew={canCreateNew()}
        />
        <Button
          label="Add"
          onClick={onAdd}
          class="ml-2"
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
