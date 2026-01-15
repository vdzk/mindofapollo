import { Title } from "@solidjs/meta"
import { createAsync } from "@solidjs/router"
import { Component, createSignal, Show } from "solid-js"
import { getOneExtRecordByIdCache } from "~/client-only/query"
import { RecordPageTitle, Subtitle } from "~/components/PageTitle"
import { StatementType } from "~/tables/statement/statement_type"
import { conclusionPlaceholder } from "~/tables/morality/directive"
import { ShowRecord } from "~/views/ShowRecord"
import { MoralProfileSelector } from "~/views/Statement/MoralProfileSelector"
import { getStatementMoralData } from "~/views/Statement/getStatementMoralData"
import { DecisionIndicator } from "~/components/DecisionIndicator"
import { createMediaQuery } from "@solid-primitives/media"

export const Statement: Component<{ id: number }> = props => {
  const statement = createAsync(async () => getOneExtRecordByIdCache('statement', props.id))
  const statementType = () => statement()?.statement_type_name as StatementType | undefined
  const isPrescriptive = () => statementType() === 'prescriptive'
  const titleText = () => (statement()?.label ?? '') as string
  const mainTitleText = () => isPrescriptive() ? titleText().slice(conclusionPlaceholder.length) : titleText()
  const [selectedMoralProfileId, setSelectedMoralProfileId] = createSignal(0)
  const moralData = createAsync(async () => isPrescriptive()
    ? getStatementMoralData(props.id, selectedMoralProfileId())
    : undefined
  )

  return (
    <main class="relative flex-1 flex flex-col">
      <Title>{titleText()}</Title>
      <ShowRecord
        tableName="statement"
        id={props.id}
        tabData={{ moralData: moralData() }}
        subBar={(
          <>
            <div class="font-bold text-2xl py-4 px-2 border-b">
              <Show when={isPrescriptive() && props.id && moralData()}>
                <DecisionIndicator score={
                  moralData()!.overlap ? moralData()!.sum : null
                } />
              </Show>
              {mainTitleText()}
            </div>
            <Show when={isPrescriptive()}>
              <MoralProfileSelector
                value={selectedMoralProfileId()}
                onChange={setSelectedMoralProfileId}
              />
            </Show>
            <div class="h-2" />
          </>
        )}
      />
    </main>
  )
}