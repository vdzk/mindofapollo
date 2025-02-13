import { Title } from "@solidjs/meta";
import { action, createAsync, redirect, useAction, useSearchParams } from "@solidjs/router";
import { Match, Show, Switch, useContext } from "solid-js";
import { Actions } from "~/components/Actions";
import { ColumnFilter, RecordDetails } from "~/components/RecordDetails";
import { schema } from "~/schema/schema";
import { deleteExtById, getExtRecordById } from "~/api/shared/extRecord";
import { SessionContext } from "~/SessionContext";
import { titleColumnName } from "~/util";
import { RecordPageTitle } from "../../components/PageTitle";
import { getPermission } from "~/getPermission";
import { getRecords } from "~/client-only/query";
import { useSafeParams } from "~/client-only/util";
import { MasterDetail } from "~/components/MasterDetail";
import { Id } from "~/types";

const _delete = action(async (
  tableName: string,
  id: Id
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
  const [searchParams, setSearchParams] = useSearchParams()
  const sp = useSafeParams<ShowRecord>(['tableName', 'id'])
  const session = useContext(SessionContext)
  const recordId = () => Number.isNaN(parseInt(sp().id)) ? sp().id : parseInt(sp().id)
  const userId = () => session?.user?.()?.id
  const record = createAsync(() => getExtRecordById(sp().tableName, recordId()))
  const titleColName = () => titleColumnName(sp().tableName)
  const deleteAction = useAction(_delete);
  const onDelete = () => deleteAction(sp().tableName, recordId())
  const titleText = () => (record()?.[titleColName()] ?? '') as string
  const premU = () => getPermission(userId(), 'update', sp().tableName, recordId())
  const premD = () => getPermission(userId(), 'delete', sp().tableName, recordId())

  const sectionOptions = () => {
    const options = []
    const { sections } = schema.tables[sp().tableName]
    if (sections) {
      for (const key in sections) {
        options.push({id: key, label: sections[key].label})
      }
    } else {
      options.push({ id: 'allDetails', label: 'details' })
    }
    options.push({ id: 'actions', label: 'actions' })
    return options
  }
  
  const selectedSection = () => (searchParams.section as string | undefined) ?? sectionOptions()[0].id

  return (
    <main>
      <Title>{titleText()}</Title>
      <RecordPageTitle tableName={sp().tableName} text={titleText()} />
      <MasterDetail
        options={sectionOptions()}
        selectedId={selectedSection()}
        onChange={(sectionId) => setSearchParams({section: sectionId})}
      >
        <Switch>
          <Match when={selectedSection() === 'actions'}>
            <Actions tableName={sp().tableName} recordId={recordId()} />
            <div>
              <a href={`/propose-change?tableName=${sp().tableName}&id=${recordId()}`} class="mx-2 text-sky-800">
                [ Propose Change ]
              </a>
              <Show when={premU().granted}>
                <a href={`/edit-record?tableName=${sp().tableName}&id=${recordId()}`} class="mx-2 text-sky-800">
                  [ Edit ]
                </a>
              </Show>
              <Show when={premD().granted}>
                <button class="mx-2 text-sky-800" onClick={onDelete}>
                  [ Delete ]
                </button>
              </Show>
            </div>
          </Match>
          <Match when>
            <RecordDetails
              tableName={sp().tableName}
              id={recordId()}
              selectedSection={selectedSection()}
            />
          </Match>
        </Switch>
      </MasterDetail>
    </main>
  );
}
