import { Title } from "@solidjs/meta";
import { action, createAsync, redirect, useAction, useSearchParams } from "@solidjs/router";
import { createEffect, Show, useContext } from "solid-js";
import { Actions } from "~/components/Actions";
import { ColumnFilter, RecordDetails } from "~/components/RecordDetails";
import { schema } from "~/schema/schema";
import { deleteExtById, getExtRecordById } from "~/api/shared/extRecord";
import { SessionContext } from "~/SessionContext";
import { titleColumnName } from "~/util";
import { RecordPageTitle } from "../../components/PageTitle";
import {UserHistory} from "~/components/histories";
import { getPermission } from "~/getPermission";
import {getRecords} from "~/client-only/query";

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
  id: string
}

export default function ShowRecord() {
  const [sp] = useSearchParams() as unknown as [ShowRecord]
  const session = useContext(SessionContext)
  const recordId = () => parseInt(sp.id)
  const userId = () => session?.user?.()?.id
  const record = createAsync(() => getExtRecordById(sp.tableName, recordId()))
  const table = () => schema.tables[sp.tableName]
  const titleColName = () => titleColumnName(sp.tableName)
  const titleColumn = () => table().columns[titleColName()]
  const displayColumn: ColumnFilter = (colName, column, visible) => visible
    && (colName !== titleColName() // show non-title
    || titleColumn().type === 'fk') // and title that is foreign key
  const deleteAction = useAction(_delete);
  const onDelete = () => deleteAction(sp.tableName, recordId())
  const titleText = () => (record()?.[titleColName()] ?? '') as string
  const premU = () => getPermission(userId() ,'update', sp.tableName, recordId())
  const premD = () => getPermission(userId() ,'delete', sp.tableName, recordId())

  return (
    <main>
      <Title>{titleText()}</Title>
      <RecordPageTitle tableName={sp.tableName} text={titleText()} />
      <RecordDetails
        tableName={sp.tableName}
        id={recordId()}
        {...{displayColumn}}
        showHistory
      />
      <Show when={sp.tableName === 'person'}>
        <UserHistory userId={recordId()}/>
      </Show>
      <Show when={session!.loggedIn()}>
        <Actions tableName={sp.tableName} recordId={recordId()}/>
        <div>
          <a href={`/propose-change?tableName=${sp.tableName}&id=${recordId()}`} class="mx-2 text-sky-800">
            [ Propose Change ]
          </a>
          <Show when={premU().granted}>
            <a href={`/edit-record?tableName=${sp.tableName}&id=${recordId()}`} class="mx-2 text-sky-800">
              [ Edit ]
            </a>
          </Show>
          <Show when={premD().granted}>
            <button class="mx-2 text-sky-800" onClick={onDelete}>
              [ Delete ]
            </button>
          </Show>
        </div>
      </Show>
    </main>
  );
}
