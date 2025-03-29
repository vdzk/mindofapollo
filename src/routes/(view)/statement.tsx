import { Title } from "@solidjs/meta"
import { createAsync, useSearchParams } from "@solidjs/router"
import { createMemo, For, Match, Show, Switch } from "solid-js"
import { getOneRecordById } from "~/api/getOne/recordById"
import { listRecords } from "~/api/list/records"
import { getOneExtRecordByIdCache, listForeignRecordsCache } from "~/client-only/query"
import { Form } from "~/components/form/Form"
import { Link } from "~/components/Link"
import { MasterDetail } from "~/components/MasterDetail"
import { RecordPageTitle } from "~/components/PageTitle"
import { schema } from "~/schema/schema"
import { BooleanColumn } from "~/schema/type"
import { ShowRecord } from "~/views/ShowRecord"
import { Argument } from "~/views/Statement/Argument"
import { Discussion } from "~/views/Statement/Discussion"

export default function Statement() {
  const [searchParams, setSearchParams] = useSearchParams()
  const recordId = createAsync(async () => {
    if (searchParams.id) {
      return parseInt(searchParams.id as string)
    } else if (searchParams.argumentId) {
      const argument = await getOneRecordById('argument', parseInt(searchParams.argumentId as string))
      if (!argument) return
      setSearchParams({ id: argument.statement_id }, { replace: true })
    }
  })
  const statement = createAsync(async () => {if (recordId()) {
    return  getOneExtRecordByIdCache('statement', recordId()!)
  }})
  const parentStatements = createAsync(async () => {if (recordId()) {
    return  listRecords('statement', recordId()!)
  }})
  const _arguments = createAsync(async () => {if (recordId()) {
    return  listForeignRecordsCache('argument', 'statement_id', recordId()!)
  }})
  const titleText = () => (statement()?.label ?? '') as string

  const argumentOptions = () => [
    ..._arguments()?.map(arg => ({
      id: arg.id,
      label: arg.title as string,
      groupId: arg.pro
    })) ?? [],
    { id: -1, label: '➕ new', groupId: true},
    { id: -2, label: '➕ new', groupId: false}
  ]
  const argumentGroups = (schema.tables.argument.columns.pro as BooleanColumn).optionLabels!.map((label, index) => ({
    id: Boolean(index),
    label
  })).reverse()
  const selectedArgument = () => searchParams.argumentId ? parseInt(searchParams.argumentId as string) : 0
  const selectedSection = () => searchParams.tab ?? 'arguments'

  const selectedFirstArgOnSide = createMemo(() => {
    const selectedId = selectedArgument()
    if (selectedId <= 0 || !_arguments()) return false
    const foundSide = [false, false]
    for (const arg of _arguments()!) {
      const sideIndex = Number(arg.pro)
      if (arg.id === selectedId) {
        return !foundSide[sideIndex]
      } else {
        foundSide[sideIndex] = true
        if (foundSide.every(x => x)) {
          return false
        }
      }
    }
    return false
  })

  return (
    <main class="relative flex-1 flex flex-col">
      <Title>{titleText()}</Title>
      <Show when={(parentStatements()?.length ?? 0) > 0}>
        <div class="flex flex-row-reverse z-10 absolute top-0 right-0 max-w-full">
          <For each={parentStatements()}>
            {parentStatement => (
              <Link
                route="statement"
                params={{ id: parentStatement.id }}
                label={'◄' + parentStatement.label}
                type="faded"
                class="pr-2 inline-block max-w-(--breakpoint-sm) whitespace-nowrap overflow-hidden text-ellipsis"
                tooltip={parentStatement.label as string}
              />
            )}
          </For>
        </div>
      </Show>
      <div class="min-h-[128px] flex items-center">
        <RecordPageTitle tableName="statement" text={titleText()} />
      </div>
      <div class="border-t pb-2" />
      <MasterDetail
        options={[
          { id: 'arguments', label: 'Arguments' },
          { id: 'details', label: 'Details' },
          { id: 'discussion', label: 'Discussion' }
        ]}
        selectedId={selectedSection()}
        onChange={id => setSearchParams({ tab: id })}
        horizontal
      >
        <Switch>
          <Match when={selectedSection() === 'arguments'}>
            <MasterDetail
              options={argumentOptions() ?? []}
              groups={argumentGroups}
              selectedId={selectedArgument()}
              onChange={id => setSearchParams({ argumentId: id })}
              class="pl-2"
              optionsClass="w-56 border-r pr-2 pt-2"
            >
              <Show when={selectedArgument() > 0}>
                <Argument
                  id={selectedArgument()!}
                  firstArgOnSide={selectedFirstArgOnSide()}
                />
              </Show>
              <Show when={selectedArgument() < 0 && recordId()}>
                <div class="pl-2">
                  <Form
                    tableName="argument"
                    preset={{
                      statement_id: recordId()!,
                      pro: selectedArgument() === -1 
                    }}
                    exitSettings={{ onExit: id => setSearchParams({ argumentId: id }) }}
                    hideColumns={['statement_id', 'pro']}
                  />
                </div>
              </Show>
            </MasterDetail>
          </Match>
          <Match when={selectedSection() === 'details' && recordId()}>
            <div class="h-4" />
            <ShowRecord
              tableName="statement"
              id={recordId()!}
              hideSections={['arguments']}
            />
          </Match>
          <Match when={selectedSection() === 'discussion' && recordId()}>
            <Discussion statementId={recordId()!} />
          </Match>
        </Switch>
      </MasterDetail>
    </main>
  )
}