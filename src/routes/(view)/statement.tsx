import { Title } from "@solidjs/meta"
import { createAsync } from "@solidjs/router"
import { createSignal, Show } from "solid-js"
import { getOneExtRecordByIdCache } from "~/client-only/query"
import { RecordPageTitle } from "~/components/PageTitle"
import { StatementType } from "~/tables/statement/statement_type"
import { conclusionPlaceholder } from "~/tables/morality/directive"
import { ShowRecord } from "~/views/ShowRecord"
import { MoralProfileSelector } from "~/views/Statement/MoralProfileSelector"
import { getStatementMoralData } from "~/views/Statement/getStatementMoralData"
import { useSafeParams } from "~/client-only/util"
import { DecisionIndicator } from "~/components/DecisionIndicator"

export default function Statement() {
  const sp = useSafeParams<{ id: number }>(['id'])
  const statement = createAsync(async () => getOneExtRecordByIdCache('statement', sp().id))
  const statementType = () => statement()?.statement_type_name as StatementType | undefined
  const isPrescriptive = () => statementType() === 'prescriptive'
  const titleText = () => (statement()?.label ?? '') as string
  const mainTitleText = () => isPrescriptive() ? titleText().slice(conclusionPlaceholder.length) : titleText()
  const [selectedMoralProfileId, setSelectedMoralProfileId] = createSignal(0)
  const moralData = createAsync(async () => isPrescriptive()
    ? getStatementMoralData(sp().id, selectedMoralProfileId())
    : undefined
  )

  return (
    <main class="relative flex-1 flex flex-col">
      <Title>{titleText()}</Title>
      <div class="min-h-[128px] flex items-center max-w-5xl">
        <RecordPageTitle
          tableName="statement"
          text={mainTitleText()}
          prefix={isPrescriptive() && sp().id && moralData()
            ? <DecisionIndicator score={moralData()!.overlap ? moralData()!.sum : null} />
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
        tabData={{moralData: moralData()}}
      />
    </main>
  )
}