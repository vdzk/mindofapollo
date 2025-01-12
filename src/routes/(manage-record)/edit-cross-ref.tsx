import { Title } from "@solidjs/meta";
import { createAsync, useAction, useSearchParams } from "@solidjs/router";
import { For } from "solid-js";
import { RecordPageTitle } from "~/components/PageTitle";
import {getRecordById, getRecords} from "~/api/shared/select";
import { firstCap, pluralTableName, titleColumnName } from "~/util";
import {
  deleteCrossRecordAction,
  insertCrossRecordAction,
  listCrossRecordsCache
} from "~/api/manage-record/edit-cross-ref";

interface EditCrossRefParams {
  a: string
  b: string
  id: string
  first?: 'true'
}

export default function EditCrossRef() {
  const [sp] = useSearchParams() as unknown as [EditCrossRefParams]
  const first = sp.first === 'true'
  const id = parseInt(sp.id)

  const aRecord = createAsync(() => getRecordById(sp.a, sp.id))
  const linkedRecords = createAsync(() => listCrossRecordsCache( sp.b, sp.a, id, first ))
  const allRrcords = createAsync(() => getRecords(sp.b))


  const linkedRecordIds = () => linkedRecords()?.map(lr => lr.id)
  const unlinkedRecords = () => allRrcords()?.filter(r => !linkedRecordIds()?.includes(r.id))

  const insertCrossRecordRun = useAction(insertCrossRecordAction)

  const onAdd = (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    insertCrossRecordRun({
      a: sp.a,
      b: sp.b,
      first,
      a_id: id,
      b_id: parseInt(formData.get('id') as string)
    })
  }

  const deleteCrossRecordRun = useAction(deleteCrossRecordAction)

  const onDelete = (linkedId: number) => {
    deleteCrossRecordRun({a: sp.a, b: sp.b, first, a_id: id, b_id: linkedId})
  }

  const bColName = titleColumnName(sp.b)
  const titleText = () => aRecord()?.[titleColumnName(sp.a)] as string | undefined

  return (
    <main>
      <Title>{titleText()}</Title>
      <RecordPageTitle tableName={sp.a} text={titleText() ?? ''} />
      <div class="px-2 pb-2">
      <div class="font-bold">{firstCap(pluralTableName(sp.b))}</div>
        <For each={linkedRecords()}>
          {lr => (
            <div>
              <a
                href={`/show-record?tableName=${sp.b}&id=${lr.id}`}
                class="hover:underline"
              >
                {lr[bColName]}
              </a>
              &nbsp;
              <button
                class="text-sky-800"
                onClick={() => onDelete(lr.id)}
                title="Remove"
              >
                [ X ]
              </button>
            </div>
          )}
        </For>
      </div>
      <form class="px-2 pb-2" onSubmit={onAdd}>
        <select name="id">
          <option></option>
          <For each={unlinkedRecords()}>
            {r => <option value={r.id}>{r[bColName]}</option>}
          </For>
        </select>
        &nbsp;
        <button type="submit" class="text-sky-800" >[ + Add ]</button>
      </form>
      <a class="text-sky-800 px-2" href={`/show-record?tableName=${sp.a}&id=${sp.id}`}>[ Back ]</a>
    </main>
  )
}
