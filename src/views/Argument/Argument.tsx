import { createAsync, revalidate } from "@solidjs/router"
import { Component, createSignal, Match, Show, Switch } from "solid-js"
import { ArgumentDetails } from "./ArgumentDetails"
import { getOneExtRecordByIdCache, listForeignRecordsCache } from "~/client-only/query"
import { ShowRecord } from "../ShowRecord"
import { ArgumentJudgement } from "./ArgumentJudgement"
import { H2, Subtitle } from "~/components/PageTitle"
import { Aggregate } from "~/components/aggregate/Aggregate"
import { StatementType } from "~/tables/statement/statement_type"
import { CriticalQuestions } from "./CriticalQuestions"
import { JudgeExamples } from "./JudgementExamples"
import { Form } from "~/components/form/Form"
import { getOneRecordByChildId } from "~/api/getOne/recordByChildId"
import { Button } from "~/components/buttons"
import { getToggleLabel } from "~/utils/string"
import { ConfidenceCriteria } from "./ConfidenceCriteria"

export const Argument: Component<{
  id: number
}> = props => {
  const record = createAsync(() => getOneExtRecordByIdCache('argument', props.id))

  const statement = createAsync(async () => getOneRecordByChildId('statement', 'argument', props.id))
  const statementType = () => statement()?.statement_type_name as StatementType | undefined
  const [showForm, setShowForm] = createSignal(false)
  const [showMoreDetails, setShowMoreDetails] = createSignal(false)
  const [showHowToJudge, setShowHowToJudge] = createSignal(false)
  const argumentTypeId = () => record()?.argument_type_id as number | undefined
  const onFormExit = () => {
    setShowForm(false)
    revalidate([
      listForeignRecordsCache.keyFor('argument', 'statement_id', record()!.statement_id as number)
    ])
  }
  return (
    <>
      <section class="flex flex-1 flex-col lg:flex-row">
        <ArgumentDetails
          id={props.id}
          record={record()}
          statement={statement()}
          showForm={showForm()}
          setShowForm={setShowForm}
          showMoreDetails={showMoreDetails()}
          setShowMoreDetails={setShowMoreDetails}
        />
        <Switch>
          <Match when={showMoreDetails()}>
            <div class="flex-5 border-l">
              <div class="h-2" />
              <ShowRecord
                tableName="argument"
                id={props.id}
                hideSections={['details', 'criticism']}
                horizontalSections
              />
            </div>
          </Match>
          <Match when={showForm() && record()}>
            <div class="flex-5 border-l pt-2">
              <Form
                tableName={'argument'}
                exitSettings={{ onExit: onFormExit }}
                id={props.id}
                record={record()!}
              />
            </div>
          </Match>
          <Match when={argumentTypeId()}>
            <CriticalQuestions
              argumentTypeId={argumentTypeId()!}
              argumentId={props.id}
            />
            <div class="border-l flex-3 min-w-0">
              <div class="flex justify-between border-b">
                <Subtitle>Judgement</Subtitle>
                <Button
                  label={getToggleLabel(showHowToJudge(), 'instructions')}
                  onClick={() => setShowHowToJudge(x => !x)}
                  class="self-center mx-2"
                />
              </div>
              <Show when={
                showHowToJudge()
                && statementType() === 'descriptive'
              }>
                <H2>Confidence crieria</H2>
                <div class="p-2 pt-0 border-b">
                  0% = this argument doesn't change confidence in the claim
                  <br/>
                  100% = this argument gives me absolute confidence in the claim
                </div>
                <ConfidenceCriteria argumentTypeId={argumentTypeId()!} />
                <JudgeExamples argumentTypeId={argumentTypeId()!} />
              </Show>
              <Show when={
                !showHowToJudge()
                && statementType() === 'prescriptive'
              }>
                <Aggregate
                  tableName="argument"
                  id={props.id}
                  aggregateName="directive_consequences"
                />
              </Show>
              <Show when={
                !showHowToJudge() && statementType()
                && (statementType() !== 'prescriptive')
              }>
                <ArgumentJudgement
                  argumentId={props.id}
                  argumentTypeId={argumentTypeId()!}
                  statementType={
                    statementType() as Exclude<
                      StatementType, 'prescriptive'
                    >
                  }
                />
              </Show>
            </div>
          </Match>
        </Switch>
      </section >
    </>
  )
}