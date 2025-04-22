import { action, createAsync, redirect, useAction, useSearchParams } from "@solidjs/router"
import { Component, createSignal, Match, Show, Switch, useContext } from "solid-js"
import { Dynamic } from "solid-js/web"
import { RecordDetails } from "~/components/RecordDetails"
import { schema } from "~/schema/schema"
import { MasterDetail } from "~/components/MasterDetail"
import { Link } from "~/components/Link"
import { Button } from "~/components/buttons"
import { componentsByName } from "~/components/componentsByName"
import { deleteById, whoCanDeleteById } from "~/api/delete/byId"
import { getOneExtRecordById } from "~/api/getOne/extRecordById"
import { useOfSelf } from "~/client-only/useOfSelf"
import { useBelongsTo } from "~/client-only/useBelongsTo"
import { whoCanUpdateRecord } from "~/api/update/record"
import { SessionContext } from "~/SessionContext"
import { RecordHistory } from "~/components/RecordHistory"
import { personalTableNames } from "~/permissions"
import { firstCap } from "~/utils/string"
import { listRecordsCache } from "~/client-only/query"
import { NestPanel } from "~/components/NestPanel"
import { UserExplField } from "~/components/form/UserExplField"
import { Form } from "~/components/form/Form"
import { Subtitle } from "~/components/PageTitle"

const deleteAction = action(async (
  tableName: string,
  id: number,
  userExpl: string
) => {
  await deleteById(tableName, id, userExpl)
  throw redirect(
    '/home-page',
    { revalidate: listRecordsCache.keyFor(tableName) }
  )
})

export const ShowRecord: Component<{
  tableName: string
  id: number
  hideSections?: string[]
  horizontalSections?: boolean
}> = props => {
  const [searchParams, setSearchParams] = useSearchParams()
  const record = createAsync(() => getOneExtRecordById(props.tableName, props.id))

  const [userExpl, setUserExpl] = createSignal('')
  const _delete = useAction(deleteAction)
  const onDelete = () => _delete(props.tableName, props.id, userExpl())
  const session = useContext(SessionContext)
  const isSelf = () => props.id === session?.userSession?.()?.userId

  const canUpdateRecord = () => useBelongsTo(whoCanUpdateRecord(
    props.tableName,
    useOfSelf(props.tableName, record()),
    isSelf()
  ))
  const canDeleteById = () => useBelongsTo(whoCanDeleteById(
    props.tableName,
    useOfSelf(props.tableName, record())
  ))

  const sectionOptions = () => {
    const options = []
    const { sections } = schema.tables[props.tableName]
    if (sections) {
      for (const [key, section] of Object.entries(sections)) {
        if (section.private && !isSelf()) continue
        options.push({ id: key, label: firstCap(section.label) })
      }
    } else {
      options.push({ id: 'allDetails', label: 'Details' })
    }
    if (!personalTableNames().includes(props.tableName)) {
      options.push({ id: 'history', label: 'History' })
    }
    if (canUpdateRecord()) {
      options.push({ id: 'edit', label: 'Edit' })
    }
    if (canDeleteById()) {
      options.push({ id: 'delete', label: 'Delete' })
    }
    const filteredOptions = props.hideSections ? options.filter(option => !props.hideSections?.includes(option.id)) : options
    return filteredOptions
  }

  const sectionParamName = () => `${props.tableName}-section`

  const selectedSection = () => (searchParams[sectionParamName()] as string | undefined) ?? sectionOptions()[0].id

  const setSectionId = (sectionId?: string) => setSearchParams({ [sectionParamName()]: sectionId })

  const getCurrentComponent = () => {
    const section = schema.tables[props.tableName].sections?.[selectedSection()]
    return section?.component ? componentsByName[section.component] : undefined
  }

  return (
    <MasterDetail
      options={sectionOptions()}
      selectedId={selectedSection()}
      onChange={setSectionId}
      class={props.horizontalSections ? '' : 'px-2'}
      horizontal={props.horizontalSections}
    >
      <Show when={props.horizontalSections}>
        <div class="h-2" />
      </Show>
      <Switch>
        <Match when={selectedSection() === 'edit'}>
          <Form
            tableName={props.tableName}
            id={props.id}
            record={record()}
            exitSettings={{ onExit: () => setSectionId() }}
          />
        </Match>
        <Match when={selectedSection() === 'delete'}>
          <Subtitle>Delete</Subtitle>
          <div class="px-2 max-w-(--breakpoint-sm)">
            <UserExplField value={userExpl()} onChange={setUserExpl} />
            <Button
              label="Delete"
              onClick={onDelete}
            />
          </div>
        </Match>
        <Match when={selectedSection() === 'history'}>
          <RecordHistory tableName={props.tableName} id={props.id} />
        </Match>
        <Match when={getCurrentComponent()}>
          <Dynamic component={getCurrentComponent()} id={props.id} />
        </Match>
        <Match when>
          <RecordDetails
            tableName={props.tableName}
            id={props.id}
            selectedSection={selectedSection()}
          />
        </Match>
      </Switch>
    </MasterDetail>
  )
}
