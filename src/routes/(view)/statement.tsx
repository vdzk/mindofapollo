import { Title } from "@solidjs/meta"
import { createAsync } from "@solidjs/router"
import { createSignal, For, Show } from "solid-js"
import { listRecords } from "~/api/list/records"
import { getOneExtRecordByIdCache } from "~/client-only/query"
import { Link } from "~/components/Link"
import { RecordPageTitle } from "~/components/PageTitle"
import { StatementType } from "~/tables/statement/statement_type"
import { conclusionPlaceholder } from "~/tables/morality/directive"
import { ShowRecord } from "~/views/ShowRecord"
import { MoralProfileSelector } from "~/views/Statement/MoralProfileSelector"
import { PrescriptiveConclusion } from "~/views/Statement/PrescriptiveConclusion"
import { useSafeParams } from "~/client-only/util"

export default function Statement() {
  const sp = useSafeParams<{ id: number }>(['id'])
  const statement = createAsync(async () => getOneExtRecordByIdCache('statement', sp().id))
  const parentStatements = createAsync(async () => listRecords('statement', sp().id))
  const statementType = () => statement()?.statement_type_name as StatementType | undefined
  const isPrescriptive = () => statementType() === 'prescriptive'
  const titleText = () => (statement()?.label ?? '') as string
  const mainTitleText = () => isPrescriptive() ? titleText().slice(conclusionPlaceholder.length) : titleText()
  const [selectedMoralProfileId, setSelectedMoralProfileId] = createSignal(0)

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
      <div class="min-h-[128px] flex items-center max-w-5xl">
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
      <Show when={isPrescriptive()}>
        <MoralProfileSelector
          value={selectedMoralProfileId()}
          onChange={setSelectedMoralProfileId}
        />
      </Show>
      <ShowRecord
        tableName="statement"
        id={sp().id}
      />
    </main>
  )
}