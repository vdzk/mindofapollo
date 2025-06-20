import { Title } from "@solidjs/meta"
import { createAsync, revalidate, useSearchParams } from "@solidjs/router"
import { createSignal, For, Match, Show, Switch } from "solid-js"
import { listRecords } from "~/api/list/records"
import { getOneExtRecordByIdCache, listForeignRecordsCache } from "~/client-only/query"
import { Aggregate } from "~/components/aggregate/Aggregate"
import { Link } from "~/components/Link"
import { MasterDetail } from "~/components/MasterDetail"
import { RecordPageTitle } from "~/components/PageTitle"
import { StatementType } from "~/tables/statement/statement_type"
import { conclusionPlaceholder } from "~/tables/morality/directive"
import { ShowRecord } from "~/views/ShowRecord"
import { Discussion } from "~/views/Statement/Discussion"
import { MoralProfileSelector } from "~/views/Statement/MoralProfileSelector"
import { PrescriptiveConclusion } from "~/views/Statement/PrescriptiveConclusion"
import { CreateArgument } from "~/views/Statement/CreateArgument"
import { useSafeParams } from "~/client-only/util"
import { Arguments } from "~/views/Statement/Arguments"

export default function Statement() {
  const [searchParams, setSearchParams] = useSearchParams()
  const sp = useSafeParams<{ id: number }>(['id'])
  const statement = createAsync(async () => getOneExtRecordByIdCache('statement', sp().id))
  const parentStatements = createAsync(async () => listRecords('statement', sp().id))
  const statementType = () => statement()?.statement_type_name as StatementType | undefined
  const isPrescriptive = () => statementType() === 'prescriptive'
  const titleText = () => (statement()?.label ?? '') as string
  const mainTitleText = () => isPrescriptive() ? titleText().slice(conclusionPlaceholder.length) : titleText()
  const [selectedMoralProfileId, setSelectedMoralProfileId] = createSignal(0)
  const selectedSection = () => searchParams.tab ?? 'arguments'

  const onFormExit = (id?: number) => {
    if (id) {
      revalidate(listForeignRecordsCache.keyFor('argument', 'statement_id', sp().id))
    }
  }

  return (
    <main class="relative flex-1 flex flex-col">
      <Title>{titleText()}</Title>
      <Show when={(parentStatements()?.length ?? 0) > 0}>
        <div class="flex flex-col lg:flex-row-reverse z-10 lg:absolute top-0 right-0 max-w-full">
          <For each={parentStatements()}>
            {parentStatement => (
              <Link
                route="statement"
                params={{
                  id: parentStatement.id,
                  argumentId: parentStatement.argument_id
                }}
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
        <RecordPageTitle
          tableName="statement"
          text={mainTitleText()}
          prefix={isPrescriptive() && sp().id
            ? <PrescriptiveConclusion
              statementId={sp().id}
              moralProfileId={selectedMoralProfileId()}
            />
            : undefined
          }
        />
      </div>
      <div class="border-t pb-2" />
      <MasterDetail
        options={[
          { id: 'arguments', label: 'Arguments' },
          { id: 'create-argument', label: 'Create Argument' },
          { id: 'details', label: 'Details' },
          ...(isPrescriptive() ? [
            { id: 'scope', label: 'Scope' }
          ] : []),
          { id: 'discussion', label: 'Discussion' }
        ]}
        selectedId={selectedSection()}
        onChange={id => setSearchParams({ tab: id })}
        horizontal
        extraPanel={isPrescriptive()
          ? <MoralProfileSelector
            value={selectedMoralProfileId()}
            onChange={setSelectedMoralProfileId}
          />
          : undefined
        }
      >
        <Switch>
          <Match when={selectedSection() === 'arguments'}>
            <Arguments statementId={sp().id} />
          </Match>
          <Match when={selectedSection() === 'create-argument'}>
            <CreateArgument
              statementId={sp().id}
              onExit={onFormExit}
            />
          </Match>
          <Match when={selectedSection() === 'details' && sp().id}>
            <div class="h-4" />
            <ShowRecord
              tableName="statement"
              id={sp().id}
              hideSections={['arguments']}
            />
          </Match>
          <Match when={selectedSection() === 'scope' && sp().id}>
            <div class="h-4" />
            <Aggregate
              tableName="directive"
              id={sp().id}
              aggregateName="people_categories"
            />
            <div class="p-2">
              Note: please refresh the page to see the scope changes reflected in the statement above.
            </div>
          </Match>
          <Match when={selectedSection() === 'discussion' && sp().id}>
            <Discussion statementId={sp().id} />
          </Match>
        </Switch>
      </MasterDetail>
    </main>
  )
}