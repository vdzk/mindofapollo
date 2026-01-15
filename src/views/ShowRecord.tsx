import { createAsync, useSearchParams } from "@solidjs/router"
import { Component, JSX, Match, Show, Switch, useContext } from "solid-js"
import { Dynamic } from "solid-js/web"
import { RecordDetails } from "~/components/RecordDetails"
import { schema } from "~/schema/schema"
import { MasterDetail } from "~/components/MasterDetail"
import { componentsByName } from "~/components/componentsByName"
import { getOneExtRecordById } from "~/api/getOne/extRecordById"
import { SessionContext } from "~/SessionContext"
import { RecordHistory } from "~/components/RecordHistory"
import { personalTableNames } from "~/permissions"
import { firstCap, humanCase } from "~/utils/string"
import { Form } from "~/components/form/Form"
import { DeleteRecord } from "~/components/form/DeleteRecord"
import { Discussion } from "./Discussion"
import { Subtitle } from "~/components/PageTitle"
import { createMediaQuery } from "@solid-primitives/media"

export const ShowRecord: Component<{
  tableName: string
  id: number
  hideSections?: string[]
  horizontalSections?: boolean
  tabData?: Record<string, any>
  subBar?: JSX.Element
}> = props => {
  const [searchParams, setSearchParams] = useSearchParams()
  const record = createAsync(() => getOneExtRecordById(props.tableName, props.id, true))
  const session = useContext(SessionContext)
  const isSelf = () => props.id === session?.userSession?.()?.userId
  const { sections, discussion } = schema.tables[props.tableName]

  const sectionOptions = () => {
    const options = []
    if (sections) {
      for (const [key, section] of Object.entries(sections)) {
        if (section.private && !isSelf()) continue
        if (section.getVisibility && (!record() || !section.getVisibility(record()!))) continue
        options.push({ id: key, label: firstCap(section.label) })
      }
    } else {
      options.push({ id: 'allDetails', label: 'Details' })
    }
    if (discussion) {
      const option = { id: 'discussion', label: 'Discussion' }
      if (discussion.showFirst) {
        options.unshift(option)
      } else {
        options.push(option)
      }
    }
    if (!personalTableNames().includes(props.tableName)) {
      options.push({ id: 'history', label: 'History' })
    }
    if (record()?.canUpdate) {
      options.push({ id: 'edit', label: 'Edit' })
    }
    if (record()?.canDelete) {
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
  
  const stackView = createMediaQuery('(max-width: 640px)')

  return (
    <div>
      <div
        class="border-b flex flex-wrap justify-between"
        classList={{
          'flex-col': stackView(),
          'items-center': !stackView()
        }}
      >
        <Subtitle>{humanCase(props.tableName)}</Subtitle>
        <MasterDetail
          options={sectionOptions()}
          selectedId={selectedSection()}
          onChange={setSectionId}
          optionsClass={"px-1 justify-end " + (stackView() ? 'border-t' : '')}
          horizontal
          pills
        />
      </div>
      {props.subBar}
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
          <DeleteRecord tableName={props.tableName} id={props.id} />
        </Match>
        <Match when={selectedSection() === 'history'}>
          <RecordHistory tableName={props.tableName} id={props.id} />
        </Match>
        <Match when={selectedSection() === 'discussion'}>
          <Discussion
            id={props.id}
            tabData={{ discussion: discussion! }}
          />
        </Match>
        <Match when={getCurrentComponent()}>
          <Dynamic
            component={getCurrentComponent()}
            id={props.id}
            tabData={props.tabData}
            setSectionId={setSectionId}
          />
        </Match>
        <Match when>
          <RecordDetails
            tableName={props.tableName}
            id={props.id}
            selectedSection={selectedSection()}
          />
        </Match>
      </Switch>

    </div>
  )
}
