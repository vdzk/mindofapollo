import { Title } from "@solidjs/meta";
import { createAsync, useSearchParams } from "@solidjs/router";
import { For } from "solid-js";
import { PageTitle } from "~/components/PageTitle";
import { schema } from "~/schema";
import { getRecords } from "~/server/api";
import { getRecordById } from "~/server/db";
import { deleteCrossRecord, insertCrossRecord, listCrossRecords } from "~/server/cross.db";
import { firstCap, titleColumnName } from "~/util";

interface CrossParams {
  a: string
  b: string
  id: string
  first: 'true' | false
}

export default function Cross() {
  const [sp] = useSearchParams() as unknown as [CrossParams, any]
  const first = sp.first === 'true'

  const aRecord = createAsync(() => getRecordById(sp.a, sp.id))
  const linkedRecords = createAsync(() => listCrossRecords( sp.b, sp.a, sp.id, first ))
  const allRrcords = createAsync(() => getRecords(sp.b))


  const linkedRecordIds = () => linkedRecords()?.map(lr => lr.id)
  const unlinkedRecords = () => allRrcords()?.filter(r => !linkedRecordIds()?.includes(r.id))

  const onAdd = (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    insertCrossRecord(sp.a, sp.b, first, sp.id, formData.get('id') as string)
  }

  const onDelete = (id: string) => {
    deleteCrossRecord(sp.a, sp.b, first, sp.id, id)
  }

  const bColName = titleColumnName(sp.b)
  const bPlural = schema.tables[sp.b].plural

  return (
    <main>
      <Title>Edit {bPlural}</Title>
      <PageTitle>Edit {bPlural}</PageTitle>
      <div class="px-2 pb-2">
        <div class="font-bold">{firstCap(sp.a)}</div>
        <div>{aRecord()?.[titleColumnName(sp.a)]}</div>
      </div>
      <div class="px-2 pb-2">
      <div class="font-bold">{firstCap(bPlural)}</div>
        <For each={linkedRecords()}>
          {lr => (
            <div>
              {lr[bColName]}
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
        <button type="submit" class="text-sky-800" >[+ Add ]</button>
      </form>
    </main>
  )
}