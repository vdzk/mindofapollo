import { Title } from "@solidjs/meta"
import { action, createAsync, redirect, useAction, useSearchParams } from "@solidjs/router"
import { Match, Show, Switch, useContext } from "solid-js"
import { Dynamic } from "solid-js/web"
import { Actions } from "~/components/Actions"
import { RecordDetails } from "~/components/RecordDetails"
import { schema } from "~/schema/schema"
import { titleColumnName } from "~/util"
import { RecordPageTitle } from "../../components/PageTitle"
import { getRecords } from "~/client-only/query"
import { useSafeParams } from "~/client-only/util"
import { MasterDetail } from "~/components/MasterDetail"
import { Link } from "~/components/Link"
import { Button } from "~/components/buttons"
import { componentsByName } from "~/components/componentsByName"
import { deleteExtById, whoCanDeleteExtById } from "~/api/delete/extById"
import { getOneExtRecordById } from "~/api/getOne/extRecordById"
import { useOfSelf } from "~/client-only/useOfSelf"
import { useBelongsTo } from "~/client-only/useBelongsTo"
import { whoCanUpdateRecord } from "~/api/update/record"
import { SessionContext } from "~/SessionContext"
import { RecordHistory } from "~/components/RecordHistory"

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
  const [searchParams, setSearchParams] = useSearchParams()
  const sp = useSafeParams<ShowRecord>(['tableName', 'id'])
  const recordId = () => parseInt(sp().id)
  const record = createAsync(() => getOneExtRecordById(sp().tableName, recordId()))
  const titleColName = () => titleColumnName(sp().tableName)
  const deleteAction = useAction(_delete)
  const onDelete = () => deleteAction(sp().tableName, recordId())
  const titleText = () => (record()?.[titleColName()] ?? '') as string
  const session = useContext(SessionContext)
  const isSelf = () => recordId() === session?.userSession?.()?.userId

  const canUpdateRecord = () => useBelongsTo(whoCanUpdateRecord(
    sp().tableName,
    useOfSelf(sp().tableName, record())
  ))
  const canDeleteExtById = () => useBelongsTo(whoCanDeleteExtById(
    sp().tableName,
    useOfSelf(sp().tableName, record())
  ))

  const sectionOptions = () => {
    const options = []
    const { sections } = schema.tables[sp().tableName]
    if (sections) {
      for (const [key, section] of Object.entries(sections)) {
        if (section.private && !isSelf()) continue
        options.push({ id: key, label: section.label })
      }
    } else {
      options.push({ id: 'allDetails', label: 'details' })
    }
    options.push({ id: 'history', label: 'History' })
    options.push({ id: 'actions', label: 'actions' })
    return options
  }

  const selectedSection = () => (searchParams.section as string | undefined) ?? sectionOptions()[0].id
  
  const getCurrentComponent = () => {
    const section = schema.tables[sp().tableName].sections?.[selectedSection()]
    return section?.component ? componentsByName[section.component] : undefined
  }

  return (
    <main>
      <Title>{titleText()}</Title>
      <RecordPageTitle tableName={sp().tableName} text={titleText()} />
      <MasterDetail
        options={sectionOptions()}
        selectedId={selectedSection()}
        onChange={(sectionId) => setSearchParams({ section: sectionId })}
        class="px-2"
      >
        <Switch>
          <Match when={selectedSection() === 'actions'}>
            <Actions tableName={sp().tableName} recordId={recordId()} />
            <div class="px-2 pb-2">
              <Link
                route="propose-change"
                params={{ tableName: sp().tableName, id: recordId() }}
                type="button"
                label="Propose Change"
              />
            </div>
            <div class="px-2 flex gap-2">
              <Show when={canUpdateRecord()}>
                <Link
                  route="edit-record"
                  params={{ tableName: sp().tableName, id: recordId() }}
                  type="button"
                  label="Edit"
                />
              </Show>
              <Show when={canDeleteExtById()}>
                <Button
                  label="Delete"
                  onClick={onDelete}
                />
              </Show>
            </div>
          </Match>
          <Match when={selectedSection() === 'history'}>
            <RecordHistory tableName={sp().tableName} id={recordId()} />
          </Match>
          <Match when={getCurrentComponent()}>
            <Dynamic component={getCurrentComponent()} id={recordId()} />
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
