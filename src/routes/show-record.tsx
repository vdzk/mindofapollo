import { Title } from "@solidjs/meta";
import { action, createAsync, redirect, useAction, useSearchParams } from "@solidjs/router";
import { Show, useContext } from "solid-js";
import { Actions } from "~/components/Actions";
import { ColumnFilter, RecordDetails } from "~/components/RecordDetails";
import { UserHistory } from "~/components/UserHistory";
import { schema } from "~/schema/schema";
import { getRecords } from "~/server/api";
import { deleteExtById, getExtRecordById } from "~/server/extRecord.db";
import { SessionContext } from "~/SessionContext";
import { titleColumnName } from "~/util";
import { RecordPageTitle } from "../components/PageTitle";

const _delete = action(async (
  tableName: string,
  id: number
) => {
  await deleteExtById(tableName, id)
  throw redirect(
    `/list-records?tableName=${tableName}`,
    // TODO: this doesn't seem to do anything
    { revalidate: getRecords.keyFor(tableName) }
  );
})

interface ShowRecord {
  tableName: string
  id: number
}

export default function ShowRecord() {
  const [sp] = useSearchParams() as unknown as [ShowRecord]
  const session = useContext(SessionContext)
  const record = createAsync(() => getExtRecordById(sp.tableName, sp.id))
  const table = () => schema.tables[sp.tableName]
  const titleColName = () => titleColumnName(sp.tableName)
  const titleColumn = () => table().columns[titleColName()]
  const displayColumn: ColumnFilter = (colName, column, visible) => visible
    && (colName !== titleColName() // show non-title
    || titleColumn().type === 'fk') // and title that is foreign key 
  const deleteAction = useAction(_delete);
  const onDelete = () => deleteAction(sp.tableName, sp.id)
  const titleText = () => (record()?.[titleColName()] ?? '') as string

  return (
    <main>
      <Title>{titleText()}</Title>
      <RecordPageTitle tableName={sp.tableName} text={titleText()} />
      <RecordDetails
        tableName={sp.tableName}
        id={sp.id}
        {...{displayColumn}}
        showHistory
      />
      <Show when={sp.tableName === 'person'}>
        <UserHistory userId={sp.id}/>
      </Show>
      <Show when={session!.loggedIn()}>
        <Actions tableName={sp.tableName} recordId={sp.id}/>
        <div>
          <a href={`/edit-record?tableName=${sp.tableName}&id=${sp.id}`} class="mx-2 text-sky-800">
            [ Edit ]
          </a>
          <Show when={!table().deny?.includes('DELETE')}>
            <button class="mx-2 text-sky-800" onClick={onDelete}>
              [ Delete ]
            </button>
          </Show>
        </div>
      </Show>
    </main>
  );
}