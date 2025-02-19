import { Title } from "@solidjs/meta"
import { createAsync, useAction } from "@solidjs/router"
import { For, createSignal } from "solid-js"
import { RecordPageTitle } from "~/components/PageTitle"
import { etv, firstCap, pluralTableName, titleColumnName } from "~/util"
import {getRecords, listCrossRecordsCache} from "~/client-only/query"
import {deleteCrossRecordAction, insertCrossRecordAction} from "~/client-only/action"
import { useSafeParams } from "~/client-only/util"
import { Link } from "~/components/Link"
import { Button } from "~/components/buttons"
import { DataRecordWithId } from "~/schema/type"
import { getRecordById } from "~/server-only/getRecordById"

interface EditCrossRefParams {
  a: string
  b: string
  id: string
  first: string
}

export default function EditCrossRef() {
  const sp = useSafeParams<EditCrossRefParams>(['a', 'b', 'id', 'first'])
  const first = sp().first === 'true'
  const id = () => parseInt(sp().id)
  const [selectedId, setSelectedId] = createSignal<string>('')

  const aRecord = createAsync(() => getRecordById(sp().a, id(), [titleColumnName(sp().a)]))
  const linkedRecords = createAsync(() => listCrossRecordsCache( sp().b, sp().a, id(), first ))
  const allRrcords = createAsync<DataRecordWithId[]>(() => getRecords(sp().b))

  const linkedRecordIds = () => linkedRecords()?.map(lr => lr.id)
  const unlinkedRecords = () => allRrcords()?.filter((r: DataRecordWithId) => !linkedRecordIds()?.includes(r.id))

  const insertCrossRecordRun = useAction(insertCrossRecordAction)

  const onAdd = () => {
    if (!selectedId()) return;
    
    insertCrossRecordRun({
      a: sp().a,
      b: sp().b,
      first,
      a_id: id(),
      b_id: parseInt(selectedId())
    })
  }

  const deleteCrossRecordRun = useAction(deleteCrossRecordAction)

  const onDelete = (linkedId: number) => {
    deleteCrossRecordRun({a: sp().a, b: sp().b, first, a_id: id(), b_id: linkedId})
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
                params={{tableName: sp().b, id: lr.id}}
                label={lr[bColName]}
              />
              <span class="inline-block w-2" />
              <Button
                label="X"
                onClick={() => onDelete(lr.id)}
                tooltip="Remove"
              />
            </div>
          )}
        </For>
      </div>
      <div class="px-2 pb-2">
        <select 
          value={selectedId()} 
          onChange={etv(setSelectedId)}
        >
          <option value="">Select...</option>
          <For each={unlinkedRecords()}>
            {r => <option value={r.id}>{r[bColName]}</option>}
          </For>
        </select>
        <span class="inline-block w-2" />
        <Button
          label="+ Add"
          onClick={onAdd}
          tooltip="Add new record"
        />
      </div>
      <Link
        route="show-record"
        params={{tableName: sp().a, id: sp().id}}
        type="button"
        label="Back"
      />
    </main>
  )
}
