import { Title } from "@solidjs/meta"
import { createAsync, useAction, useSearchParams } from "@solidjs/router"
import { Component, Match, Show, Switch, useContext } from "solid-js"
import { Dynamic } from "solid-js/web"
import { Actions } from "~/components/Actions"
import { RecordDetails } from "~/components/RecordDetails"
import { schema } from "~/schema/schema"
import { titleColumnName } from "~/utils/schema"
import { MasterDetail } from "~/components/MasterDetail"
import { Link } from "~/components/Link"
import { Button } from "~/components/buttons"
import { componentsByName } from "~/components/componentsByName"
import { whoCanDeleteExtById } from "~/api/delete/extById"
import { getOneExtRecordById } from "~/api/getOne/extRecordById"
import { useOfSelf } from "~/client-only/useOfSelf"
import { useBelongsTo } from "~/client-only/useBelongsTo"
import { whoCanUpdateRecord } from "~/api/update/record"
import { SessionContext } from "~/SessionContext"
import { RecordHistory } from "~/components/RecordHistory"
import { personalTableNames } from "~/permissions"
import { _delete } from "~/client-only/action"
import { firstCap } from "~/utils/string"

export const ShowRecord: Component<{
  tableName: string
  id: number
  hideSections?: string[]
  horizontalSections?: boolean
}> = props => {
  const [searchParams, setSearchParams] = useSearchParams()
  const record = createAsync(() => getOneExtRecordById(props.tableName, props.id))
  const deleteAction = useAction(_delete)
  const onDelete = () => deleteAction(props.tableName, props.id)
  const session = useContext(SessionContext)
  const isSelf = () => props.id === session?.userSession?.()?.userId

  const canUpdateRecord = () => useBelongsTo(whoCanUpdateRecord(
    props.tableName,
    useOfSelf(props.tableName, record()),
    isSelf()
  ))
  const canDeleteExtById = () => useBelongsTo(whoCanDeleteExtById(
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
    if (!personalTableNames.includes(props.tableName)) {
      options.push({ id: 'history', label: 'History' })
    }
    options.push({ id: 'actions', label: 'Actions' })
    const filteredOptions = props.hideSections ? options.filter(option => !props.hideSections?.includes(option.id)) : options  
    return filteredOptions
  }

  const sectionParamName = () => `${props.tableName}-section`

  const selectedSection = () => (searchParams[sectionParamName()] as string | undefined) ?? sectionOptions()[0].id

  const getCurrentComponent = () => {
    const section = schema.tables[props.tableName].sections?.[selectedSection()]
    return section?.component ? componentsByName[section.component] : undefined
  }

  return (
    <MasterDetail
      options={sectionOptions()}
      selectedId={selectedSection()}
      onChange={(sectionId) => setSearchParams({ [sectionParamName()]: sectionId })}
      class={props.horizontalSections ? '' : 'px-2'}
      horizontal={props.horizontalSections}
    >
      <Show when={props.horizontalSections}>
        <div class="h-2" />
      </Show>
      <Switch>
        <Match when={selectedSection() === 'actions'}>
          <Actions tableName={props.tableName} recordId={props.id} />
          <div class="px-2 pb-2">
            <Link
              route="propose-change"
              params={{ tableName: props.tableName, id: props.id }}
              type="button"
              label="Propose Change"
            />
          </div>
          <div class="px-2 flex gap-2">
            <Show when={canUpdateRecord()}>
              <Link
                route="edit-record"
                params={{ tableName: props.tableName, id: props.id }}
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
