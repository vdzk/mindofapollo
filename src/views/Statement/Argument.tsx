import { createAsync } from "@solidjs/router"
import { Component, createEffect, createSignal, Match, Show, Switch } from "solid-js"
import { ArgumentDetails } from "./ArgumentDetails"
import { getOneExtRecordByIdCache } from "~/client-only/query"
import { ShowRecord } from "../ShowRecord"
import { ArgumentJudgement } from "./ArgumentJudgement"
import { Subtitle } from "~/components/PageTitle"
import { Aggregate } from "~/components/aggregate/Aggregate"
import { StatementType } from "~/tables/statement/statement_type"
import { CriticalQuestions } from "./CriticalQuestions"
import { JudgeExamples } from "./JudgementExamples"
import { create } from "~/schema/createDbSchema"

export const Argument: Component<{
  id: number,
  firstArgOnSide: boolean,
  refreshStatementConfidence: () => Promise<void>,
  statementType: StatementType
}> = props => {
  const record = createAsync(() => getOneExtRecordByIdCache('argument', props.id))
  const [showMoreDetails, setShowMoreDetails] = createSignal(false)
  const [showExamples, setShowExamples] = createSignal(false)
  const argumentTypeId = () => record()?.argument_type_id as number | undefined
  createEffect(() => {
    props.id
    setShowMoreDetails(false)
    setShowExamples(false)
  })
  return (
    <>
      <section class="flex flex-1 flex-col lg:flex-row">
        <ArgumentDetails
          record={record()}
          showMoreDetails={showMoreDetails()}
          setShowMoreDetails={setShowMoreDetails}
        />
        <Switch>
          <Match when={showMoreDetails()}>
            <div class="flex-2 border-l">
              <div class="h-2" />
              <ShowRecord
                tableName="argument"
                id={props.id}
                hideSections={['details', 'criticism']}
                horizontalSections
              />
            </div>
          </Match>
          <Match when={!showMoreDetails() && argumentTypeId()}>
            <>
              <CriticalQuestions
                argumentTypeId={argumentTypeId()!}
                argumentId={props.id}
              />
              <div class="border-l flex-1">
                <Subtitle>Judgement</Subtitle>
                <Show when={props.statementType === 'prescriptive'}>
                  <Aggregate
                    tableName="argument"
                    id={props.id}
                    aggregateName="directive_consequences"
                  />
                </Show>
                <Show when={props.statementType !== 'prescriptive'}>
                  <ArgumentJudgement
                    argumentId={props.id}
                    argumentTypeId={argumentTypeId()!}
                    firstArgOnSide={props.firstArgOnSide}
                    refreshStatementConfidence={props.refreshStatementConfidence}
                    statementType={props.statementType as Exclude<StatementType, 'prescriptive'>}
                    showExamples={showExamples()}
                    setShowExamples={setShowExamples}
                  />
                </Show>
              </div>
            </>
          </Match>
        </Switch>
      </section >
      <Show when={showExamples()}>
        <JudgeExamples argumentTypeId={argumentTypeId()!} />
      </Show>
    </>
  )
}